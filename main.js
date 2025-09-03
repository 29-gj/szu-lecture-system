// 主页面JavaScript逻辑
$(document).ready(function() {
    // 初始化页面
    initPage();
    
    // 导航标签切换
    $('.nav-tab').click(function() {
        const tab = $(this).data('tab');
        switchMainTab(tab);
    });
    
    // 子导航切换
    $('.sub-tab').click(function() {
        const filter = $(this).data('filter');
        switchFilter(filter);
        loadLectures(filter);
    });
    
    // 初始加载全部讲座
    loadLectures('all');
    
    // 如果当前在我的板块，加载用户信息
    if ($('#profile').hasClass('active')) {
        loadUserInfo();
        loadPendingActivities();
    }
});

function initPage() {
    // 设置默认激活的标签
    $('.nav-tab[data-tab="enrollment"]').addClass('active');
    $('#enrollment').addClass('active');
}

function switchMainTab(tab) {
    // 切换主导航标签
    $('.nav-tab').removeClass('active');
    $('.nav-tab[data-tab="' + tab + '"]').addClass('active');
    
    // 切换内容区域
    $('.tab-content').removeClass('active');
    $('#' + tab).addClass('active');
    
    // 根据标签加载相应内容
    if (tab === 'profile') {
        loadUserInfo();
        loadPendingActivities();
    }
}

function switchFilter(filter) {
    // 切换子导航
    $('.sub-tab').removeClass('active');
    $('.sub-tab[data-filter="' + filter + '"]').addClass('active');
}

function loadLectures(filter = 'all') {
    const container = $('#lecturesContainer');
    container.html('<div class="loading">加载中...</div>');
    
    $.ajax({
        url: '/api/lectures',
        method: 'GET',
        data: { filter: filter },
        success: function(lectures) {
            displayLectures(lectures);
        },
        error: function() {
            container.html('<div class="empty-state">加载失败，请重试</div>');
        }
    });
}

function displayLectures(lectures) {
    const container = $('#lecturesContainer');
    
    if (lectures.length === 0) {
        container.html('<div class="empty-state">暂无讲座</div>');
        return;
    }
    
    let html = '';
    lectures.forEach(function(lecture) {
        const statusText = getStatusText(lecture.status);
        const canEnroll = lecture.status === 'enrolling' || lecture.status === 'full';
        
        let buttonText, buttonClass, buttonAction;
        if (!canEnroll) {
            buttonText = statusText;
            buttonClass = 'btn-enroll disabled';
            buttonAction = 'disabled';
        } else {
            buttonText = '立即报名';
            buttonClass = 'btn-enroll';
            buttonAction = `onclick="goToClassroomSelection(${lecture.id})"`;
        }
        
        html += `
            <div class="lecture-card" data-lecture-id="${lecture.id}">
                <h3>${lecture.name}</h3>
                <p><strong>主讲人：</strong>${lecture.speaker}</p>
                <p><strong>地点：</strong>${lecture.location}</p>
                <p><strong>报名开始时间：</strong>${lecture.enroll_start_time}</p>
                <p><strong>讲座开始时间：</strong>${lecture.lecture_start_time}</p>
                <p><strong>状态：</strong><span class="status ${lecture.status}">${statusText}</span></p>
                <div class="button-container">
                    <button class="${buttonClass}" 
                            data-lecture-id="${lecture.id}"
                            ${buttonAction}>
                        ${buttonText}
                    </button>
                    <button class="btn-detail" onclick="goToLectureDetail(${lecture.id})">
                        详情
                    </button>
                </div>
            </div>
        `;
    });
    
    container.html(html);
}

function getStatusText(status) {
    const statusMap = {
        'enrolling': '正在报名',
        'not_started': '未开始',
        'ended': '已结束',
        'full': '已报满'
    };
    return statusMap[status] || '未知状态';
}

function loadUserInfo() {
    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        success: function(userInfo) {
            displayUserInfo(userInfo);
        },
        error: function() {
            console.error('加载用户信息失败');
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
    $('#userStats').html(html);
}

function loadPendingActivities() {
    $.ajax({
        url: '/api/user/enrollments',
        method: 'GET',
        success: function(enrollments) {
            displayPendingActivities(enrollments);
        },
        error: function() {
            console.error('加载待参加活动失败');
        }
    });
}

function displayPendingActivities(enrollments) {
    const pendingActivities = enrollments.filter(e => e.status === 'enrolled');
    const container = $('#pendingActivities');
    
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

// 导航函数
function goToClassroomSelection(lectureId) {
    window.location.href = '/classroom/' + lectureId;
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
                    if ($('#pendingActivities .activity-item').length === 0) {
                        $('#pendingActivities').html('<div class="empty-state">暂无待参加活动</div>');
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