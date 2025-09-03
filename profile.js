// 个人信息页面JavaScript逻辑
$(document).ready(function() {
    loadUserInfo();
    loadPendingActivities();
});

function loadUserInfo() {
    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        success: function(userInfo) {
            displayUserInfo(userInfo);
        },
        error: function() {
            $('#userInfo').html('<div class="empty-state">加载用户信息失败</div>');
        }
    });
}

function displayUserInfo(userInfo) {
    const html = `
        <div class="user-name">${userInfo.name}</div>
        <div class="stat-item">
            <span class="stat-number">${userInfo.online_sessions}</span>
            <span class="stat-label">线上学习</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${userInfo.offline_sessions}</span>
            <span class="stat-label">线下学习</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${userInfo.total_progress}%</span>
            <span class="stat-label">总进度</span>
        </div>
    `;
    $('#userInfo').html(html);
}

function loadPendingActivities() {
    $.ajax({
        url: '/api/user/enrollments',
        method: 'GET',
        success: function(enrollments) {
            displayPendingActivities(enrollments);
        },
        error: function() {
            $('#pendingList').html('<div class="empty-state">加载待参加活动失败</div>');
        }
    });
}

function displayPendingActivities(enrollments) {
    const pendingActivities = enrollments.filter(e => e.status === 'enrolled');
    const container = $('#pendingList');
    
    if (pendingActivities.length === 0) {
        container.html('<div class="empty-state">暂无待参加活动</div>');
        return;
    }
    
    let html = '';
    pendingActivities.forEach(function(activity) {
        const lecture = activity.lecture;
        const classroom = activity.classroom;
        
        html += `
            <div class="activity-item" data-enrollment-id="${activity.lecture_id}">
                <h4>${lecture.name}</h4>
                <p><strong>主讲人：</strong>${lecture.speaker}</p>
                <p><strong>时间：</strong>${lecture.lecture_start_time}</p>
                <p><strong>地点：</strong>${classroom ? classroom.campus + '校区' + classroom.building + classroom.room : lecture.location}</p>
                <p><strong>座位：</strong>${activity.seat_number || '待分配'}</p>
                <div class="activity-actions">
                    <button class="btn-detail" onclick="goToLectureDetail(${lecture.id})">
                        详情
                    </button>
                    <button class="btn-cancel" onclick="cancelEnrollmentFromProfile(${lecture.id}, this)">
                        取消报名
                    </button>
                </div>
            </div>
        `;
    });
    
    container.html(html);
}

function goToLectureDetail(lectureId) {
    window.location.href = '/lecture/' + lectureId;
}

function goToHistory() {
    window.location.href = '/history';
}

function goBack() {
    window.history.back();
}

// 从个人中心取消报名
function cancelEnrollmentFromProfile(lectureId, buttonElement) {
    // 显示确认对话框
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
                // 移除该活动项
                const activityItem = $(buttonElement).closest('.activity-item');
                activityItem.fadeOut(300, function() {
                    $(this).remove();
                    // 检查是否还有其他活动
                    if ($('#pendingList .activity-item').length === 0) {
                        $('#pendingList').html('<div class="empty-state">暂无待参加活动</div>');
                    }
                });
            } else {
                alert('取消报名失败：' + response.message);
            }
        },
        error: function() {
            alert('取消报名失败，请重试');
        }
    });
}