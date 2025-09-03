// 教室选择页面JavaScript逻辑
$(document).ready(function() {
    // 检查是否所有教室都已满
    checkAllRoomsFull();
    
    // 报名按钮点击事件
    $('.btn-enroll:not(:disabled)').click(function() {
        const lectureId = $(this).data('lecture-id');
        const roomId = $(this).data('room-id');
        enrollLecture(lectureId, roomId);
    });
    
    // 取消报名按钮点击事件
    $('.btn-cancel:not(:disabled)').click(function() {
        const lectureId = $(this).data('lecture-id');
        cancelEnrollment(lectureId);
    });
});

function checkAllRoomsFull() {
    // 检查是否所有教室都已满
    const allRoomsFull = $('.btn-enroll:not(:disabled)').length === 0;
    
    if (allRoomsFull) {
        // 如果所有教室都已满，禁用所有取消报名按钮
        $('.btn-cancel').prop('disabled', true).addClass('disabled');
        
        // 显示提示信息
        if ($('.no-rooms-message').length === 0) {
            $('.classroom-list').before('<div class="no-rooms-message">所有教室已满，无法报名</div>');
        }
    }
}

function enrollLecture(lectureId, roomId) {
    // 确认对话框
    if (!confirm('确定要报名这个讲座吗？')) {
        return;
    }
    
    $.ajax({
        url: '/api/enroll',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lecture_id: lectureId,
            classroom_id: roomId
        }),
        success: function(response) {
            if (response.success) {
                alert('报名成功！');
                // 返回主页
                window.location.href = '/';
            } else {
                alert('报名失败：' + response.message);
            }
        },
        error: function() {
            alert('报名失败，请重试');
        }
    });
}

function cancelEnrollment(lectureId) {
    // 确认对话框
    if (!confirm('确定要取消报名吗？')) {
        return;
    }
    
    $.ajax({
        url: '/api/cancel_enroll',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lecture_id: lectureId
        }),
        success: function(response) {
            if (response.success) {
                alert('取消报名成功！');
                // 返回主页
                window.location.href = '/';
            } else {
                alert('取消报名失败：' + response.message);
            }
        },
        error: function() {
            alert('取消报名失败，请重试');
        }
    });
}

function goBack() {
    window.history.back();
}