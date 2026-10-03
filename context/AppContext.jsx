import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDocumentFile, supabase } from '../utils/supabase';
import { getAvailableDocumentName } from '../utils/documentNames';

const AppContext = createContext(null);

const USER_STORAGE_KEY = '@groupdocs_user';

const emptyUser = {
  id: '',
  name: '',
  email: '',
  initials: '',
};

const makeCode = () =>
  Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const normalizeEmail = (email = '') =>
  email.trim().toLowerCase();

const appUser = (row) => ({
  id: row.id,
  name:
    row.full_name ||
    row.email?.split('@')[0] ||
    'Người dùng',
  email: row.email || '',
  initials:
    row.initials ||
    initials(row.full_name || row.email),
});

// Đăng nhập đơn giản cho app demo/học tập.
// Không thay thế hệ thống Auth bảo mật cho production.
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Dùng để tránh hiện màn Login trong lúc đang đọc
  // phiên đăng nhập từ AsyncStorage.
  const [authLoading, setAuthLoading] =
    useState(true);

  const currentUser =
    user || emptyUser;

  /* =========================
     LOAD USER ĐÃ LƯU
  ========================= */

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const savedUser =
          await AsyncStorage.getItem(
            USER_STORAGE_KEY
          );

        if (savedUser) {
          const parsedUser =
            JSON.parse(savedUser);

          setUser(parsedUser);
        }
      } catch (error) {
        console.log(
          'Không thể khôi phục đăng nhập:',
          error
        );
      } finally {
        setAuthLoading(false);
      }
    };

    restoreUser();
  }, []);

  /* =========================
     LOAD DATA
  ========================= */

  const loadData = useCallback(
    async (activeUser) => {
      if (!supabase || !activeUser) {
        return;
      }

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
        .from('group_members')
        .select(
          `
          group_id,
          role,
          groups(
            id,
            name,
            description,
            code,
            owner_id,
            color,
            created_at
          )
        `
        )
        .eq(
          'user_id',
          activeUser.id
        );

      if (membershipError) {
        console.log(
          'Lỗi tải nhóm:',
          membershipError
        );
        return;
      }

      const baseGroups = (
        memberships || []
      )
        .map((item) => ({
          ...item.groups,
          role: item.role,
        }))
        .filter(Boolean);

      const groupIds =
        baseGroups.map(
          (group) => group.id
        );

      if (!groupIds.length) {
        setGroups([]);
        setDocuments([]);
        return;
      }

      const [
        { data: memberRows },
        { data: documentRows },
      ] = await Promise.all([
        supabase
          .from('group_members')
          .select(
            `
            group_id,
            user_id,
            role,
            app_users(
              id,
              full_name,
              email,
              initials
            )
          `
          )
          .in(
            'group_id',
            groupIds
          ),

        supabase
          .from('documents')
          .select('*')
          .in(
            'group_id',
            groupIds
          )
          .order(
            'upload_date',
            {
              ascending: false,
            }
          ),
      ]);

      const hydratedGroups =
        baseGroups.map(
          (group) => ({
            ...group,

            lastActive:
              'Gần đây',

            members: (
              memberRows || []
            )
              .filter(
                (member) =>
                  member.group_id ===
                  group.id
              )
              .map(
                (member) => ({
                  id:
                    member
                      .app_users
                      ?.id ||
                    member.user_id,

                  name:
                    member
                      .app_users
                      ?.full_name ||
                    'Thành viên',

                  email:
                    member
                      .app_users
                      ?.email ||
                    '',

                  initials:
                    member
                      .app_users
                      ?.initials ||
                    '',

                  role:
                    member.role,
                })
              ),
          })
        );

      setGroups(
        hydratedGroups
      );

      setDocuments(
        (documentRows || []).map(
          (document) => ({
            id: document.id,

            name:
              document.name,

            uri:
              document.uri,

            size:
              Number(
                document.size
              ) || 0,

            type:
              document.type,

            mimeType:
              document.mime_type,

            groupId:
              document.group_id,

            uploader:
              document.uploader_name,

            uploaderId:
              document.uploader_id,

            sharedBy:
              document.shared_by_name,

            date:
              document.upload_date,
          })
        )
      );
    },
    []
  );

  /* =========================
     LOAD DATA KHI CÓ USER
  ========================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      loadData(user);
    } else {
      setGroups([]);
      setDocuments([]);
    }
  }, [
    user,
    authLoading,
    loadData,
  ]);

  /* =========================
     LOGIN
  ========================= */

  const login = async (
    email,
    password
  ) => {
    if (!supabase) {
      return {
        ok: false,
        error:
          'Chưa cấu hình Supabase.',
      };
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      'login_app_user',
      {
        p_email:
          normalizeEmail(email),

        p_password:
          password,
      }
    );

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    const row =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!row) {
      return {
        ok: false,
        error:
          'Email hoặc mật khẩu không đúng.',
      };
    }

    const loggedInUser =
      appUser(row);

    // Lưu user vào bộ nhớ
    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(
        loggedInUser
      )
    );

    setUser(
      loggedInUser
    );

    return {
      ok: true,
    };
  };

  /* =========================
     REGISTER
  ========================= */

  const register = async (
    form
  ) => {
    if (!supabase) {
      return {
        ok: false,
        error:
          'Chưa cấu hình Supabase.',
      };
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      'register_app_user',
      {
        p_full_name:
          form.name.trim(),

        p_email:
          normalizeEmail(
            form.email
          ),

        p_password:
          form.password,

        p_initials:
          initials(
            form.name
          ),
      }
    );

    if (error) {
      return {
        ok: false,

        error:
          error.message.includes(
            'duplicate'
          )
            ? 'Email này đã được đăng ký.'
            : error.message,
      };
    }

    if (!data) {
      return {
        ok: false,
        error:
          'Không thể tạo tài khoản.',
      };
    }

    return {
      ok: true,
    };
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(
        USER_STORAGE_KEY
      );
    } catch (error) {
      console.log(
        'Lỗi xóa phiên đăng nhập:',
        error
      );
    }

    setUser(null);
    setGroups([]);
    setDocuments([]);
  };

  /* =========================
     ADD GROUP
  ========================= */

  const addGroup = async (
    name,
    description
  ) => {
    const payload = {
      name,
      description,
      code: makeCode(),
      owner_id:
        currentUser.id,
      color: '#8B5CF6',
    };

    const {
      data,
      error,
    } = await supabase
      .from('groups')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    await loadData(
      currentUser
    );

    return {
      ok: true,
      group: data,
    };
  };

  /* =========================
     JOIN GROUP
  ========================= */

  const joinGroup = async (
    code
  ) => {
    const {
      data,
      error,
    } = await supabase.rpc(
      'join_group_by_code',
      {
        p_code: code,
        p_user_id:
          currentUser.id,
      }
    );

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    await loadData(
      currentUser
    );

    return {
      ok: true,
      id: data,
    };
  };

  /* =========================
     ADD DOCUMENT
  ========================= */

  const addDocument = async (
    document
  ) => {
    const { data: existingDocuments, error: checkError } = await supabase
      .from('documents')
      .select('name')
      .eq('group_id', document.groupId);

    if (checkError) {
      return {
        ok: false,
        error: checkError.message,
      };
    }

    const finalName = getAvailableDocumentName(
      document.name,
      (existingDocuments || []).map((item) => item.name)
    );

    const {
      error,
    } = await supabase
      .from('documents')
      .insert({
        name:
          finalName,

        uri:
          document.uri,

        size:
          document.size,

        type:
          document.type,

        mime_type:
          document.mimeType,

        group_id:
          document.groupId,

        uploader_id:
          currentUser.id,

        uploader_name:
          currentUser.name,
      });

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    await loadData(
      currentUser
    );

    return {
      ok: true,
      finalName,
      renamed: finalName !== document.name,
    };
  };

  const shareDocumentToGroup = async (document, targetGroupId) => {
    try {
      if (!document) {
        return {
          ok: false,
          error: 'Không tìm thấy tài liệu.',
        };
      }

      if (!targetGroupId) {
        return {
          ok: false,
          error: 'Không tìm thấy nhóm đích.',
        };
      }

      if (document.groupId === targetGroupId) {
        return {
          ok: false,
          error: 'Tài liệu đã tồn tại trong nhóm này.',
        };
      }

      // Lấy danh sách tên file trong nhóm đích
      const { data: existingDocuments, error: checkError } = await supabase
        .from('documents')
        .select('name')
        .eq('group_id', targetGroupId);

      if (checkError) {
        return {
          ok: false,
          error: checkError.message,
        };
      }

      const finalName = getAvailableDocumentName(
        document.name,
        (existingDocuments || []).map((item) => item.name)
      );

      const payload = {
        name: finalName,
        uri: document.uri,
        size: document.size || 0,
        type: document.type || '',
        mime_type: document.mimeType || null,
        group_id: targetGroupId,
        uploader_id: document.uploaderId || currentUser.id,
        uploader_name: document.uploader || currentUser.name,
        shared_by_id: currentUser.id,
        shared_by_name: currentUser.name,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return {
          ok: false,
          error: error.message || 'Không thể chia sẻ tài liệu.',
        };
      }

      await loadData(currentUser);

      return {
        ok: true,
        document: data,
        finalName,
        renamed: finalName !== document.name,
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || 'Không thể chia sẻ tài liệu.',
      };
    }
  };

  /* =========================
     DELETE DOCUMENT
  ========================= */

  const deleteDocument =
    async (id) => {
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('uri')
        .eq('id', id)
        .single();

      if (documentError) {
        return {
          ok: false,
          error: documentError.message,
        };
      }

      const {
        error,
      } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          ok: false,
          error: error.message,
        };
      }

      let storageError;

      if (document?.uri) {
        const { data: linkedDocuments, error: linkError } = await supabase
          .from('documents')
          .select('id')
          .eq('uri', document.uri)
          .limit(1);

        if (linkError) {
          storageError = linkError.message;
        } else if (!linkedDocuments?.length) {
          try {
            await deleteDocumentFile(document.uri);
          } catch (fileError) {
            storageError = fileError?.message;
          }
        }
      }

      await loadData(
        currentUser
      );

      return {
        ok: true,
        storageError,
      };
    };

  /* =========================
     REMOVE MEMBER
  ========================= */

  const removeMember =
    async (
      groupId,
      userId
    ) => {
      if (
        userId ===
        currentUser.id
      ) {
        return {
          ok: false,
          error:
            'Không thể tự xóa chính mình khỏi nhóm.',
        };
      }

      const group =
        groups.find(
          (item) =>
            item.id ===
            groupId
        );

      if (
        !group ||
        group.owner_id !==
        currentUser.id
      ) {
        return {
          ok: false,
          error:
            'Chỉ trưởng nhóm mới có thể xóa thành viên.',
        };
      }

      const {
        error,
      } = await supabase
        .from(
          'group_members'
        )
        .delete()
        .eq(
          'group_id',
          groupId
        )
        .eq(
          'user_id',
          userId
        );

      if (error) {
        return {
          ok: false,
          error:
            error.message,
        };
      }

      await loadData(
        currentUser
      );

      return {
        ok: true,
      };
    };

  /* =========================
     DELETE GROUP
  ========================= */

  const deleteGroup =
    async (groupId) => {
      const group =
        groups.find(
          (item) =>
            item.id ===
            groupId
        );

      if (!group) {
        return {
          ok: false,
          error:
            'Không tìm thấy nhóm.',
        };
      }

      if (
        group.owner_id !==
        currentUser.id
      ) {
        return {
          ok: false,
          error:
            'Chỉ trưởng nhóm mới có thể xóa nhóm.',
        };
      }

      const {
        error,
      } = await supabase
        .from('groups')
        .delete()
        .eq(
          'id',
          groupId
        );

      if (error) {
        return {
          ok: false,
          error:
            error.message,
        };
      }

      await loadData(
        currentUser
      );

      return {
        ok: true,
      };
    };

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = useMemo(
    () => ({
      user,
      authLoading,

      login,
      register,
      logout,

      groups,
      documents,

      addGroup,
      joinGroup,

      addDocument,
      shareDocumentToGroup,
      deleteDocument,

      removeMember,
      deleteGroup,

      currentUser,
    }),
    [
      user,
      authLoading,
      groups,
      documents,
    ]
  );
  if (authLoading) {
    return null;
  }

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () =>
  useContext(AppContext);
