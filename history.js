// 历史报名页面JavaScript逻辑
$(document).ready(function() {
    loadHistoryEnrollments();
});

function loadHistoryEnrollments() {
    $.ajax({
        url: '/api/user/enrollments',
        method: 'GET',
        success: function(enrollments) {
            displayHistoryEnrollments(enrollments);
        },
        error: function() {
            $('#historyList').html('<div class="empty-state">加载历史报名信息失败</div>');
        }
    });
}

function displayHistoryEnrollments(enrollments) {
    const container = $('#historyList');
    
    if (enrollments.length === 0) {
        container.html('<div class="empty-state">暂无历史报名记录</div>');
        return;
    }
    
    let html = '';
    enrollments.forEach(function(enrollment) {
        const lecture = enrollment.lecture;
        const classroom = enrollment.classroom;
        const statusText = getStatusText(enrollment.status);
        
        html += `
            <div class="history-item">
                <h4>${lecture.name}</h4>
                <p><strong>主讲人：</strong>${lecture.speaker}</p>
                <p><strong>时间：</strong>${lecture.lecture_start_time}</p>
                <p><strong>地点：</strong>${classroom ? classroom.campus + '校区' + classroom.building + classroom.room : lecture.location}</p>
                <p><strong>座位：</strong>${enrollment.seat_number || '待分配'}</p>
                <p><strong>报名时间：</strong>${enrollment.enroll_time}</p>
                <p><strong>状态：</strong><span class="status ${enrollment.status}">${statusText}</span></p>
                <button class="btn-detail" onclick="goToLectureDetail(${lecture.id})">
                    详情
                </button>
            </div>
        `;
    });
    
    container.html(html);
}

function getStatusText(status) {
    const statusMap = {
        'enrolled': '已报名',
        'attended': '已出席',
        'absent': '缺席'
    };
    return statusMap[status] || '未知状态';
}

function goToLectureDetail(lectureId) {
    window.location.href = '/lecture/' + lectureId;
}

function goBack() {
    window.history.back();
}