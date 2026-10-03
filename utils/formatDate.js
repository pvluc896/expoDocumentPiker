export const formatDate = (date) => 
    new Intl.DateTimeFormat('vi-VN', 
        { day: '2-digit', month: '2-digit', year: 'numeric' })
        .format(new Date(date));
