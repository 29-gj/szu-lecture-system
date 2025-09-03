from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from datetime import datetime, timedelta
import json

app = Flask(__name__)
app.secret_key = 'szu_lecture_secret_key'

# 模拟数据库存储
lectures_data = []
classrooms_data = []
user_enrollments = []
user_info = {}

# 用户报名状态跟踪
user_enrollment_status = {}

def init_data():
    """初始化示例数据"""
    global lectures_data, classrooms_data, user_info, user_enrollment_status
    
    # 讲座数据
    lectures_data = [
        {
            'id': 1,
            'name': '人工智能与未来科技发展',
            'speaker': '张教授',
            'location': '粤海校区A1-101',
            'enroll_start_time': '2025-09-01 09:00:00',
            'lecture_start_time': '2025-09-15 14:00:00',
            'status': 'enrolling',  # enrolling, not_started, ended
            'description': '探讨人工智能技术在各个领域的应用前景和发展趋势',
            'category': 'technology'
        },
        {
            'id': 2,
            'name': '创新创业实践与思考',
            'speaker': '李总经理',
            'location': '丽湖校区B2-201',
            'enroll_start_time': '2025-09-10 10:00:00',
            'lecture_start_time': '2025-09-20 16:00:00',
            'status': 'not_started',
            'description': '分享创新创业的实践经验和成功案例',
            'category': 'business'
        },
        {
            'id': 3,
            'name': '量子计算前沿技术',
            'speaker': '王院士',
            'location': '粤海校区C3-301',
            'enroll_start_time': '2025-08-25 08:00:00',
            'lecture_start_time': '2025-09-05 15:00:00',
            'status': 'enrolling',
            'description': '介绍量子计算的基本原理和最新研究进展',
            'category': 'technology'
        },
        {
            'id': 4,
            'name': '可持续发展与环境保护',
            'speaker': '陈研究员',
            'location': '丽湖校区D1-401',
            'enroll_start_time': '2025-09-05 09:00:00',
            'lecture_start_time': '2025-09-25 10:00:00',
            'status': 'not_started',
            'description': '探讨可持续发展理念和环境保护的重要性',
            'category': 'environment'
        },
        {
            'id': 5,
            'name': '区块链技术与数字经济',
            'speaker': '刘博士',
            'location': '粤海校区E2-202',
            'enroll_start_time': '2025-08-20 09:00:00',
            'lecture_start_time': '2025-08-30 14:00:00',
            'status': 'ended',
            'description': '解析区块链技术原理及其在数字经济中的应用',
            'category': 'technology'
        },
        {
            'id': 6,
            'name': '机器学习实战应用',
            'speaker': '陈教授',
            'location': '丽湖校区F3-301',
            'enroll_start_time': '2025-09-01 08:00:00',
            'lecture_start_time': '2025-09-18 16:00:00',
            'status': 'full',
            'description': '通过实际案例学习机器学习算法的应用和实现',
            'category': 'technology'
        }
    ]
    
    # 教室数据
    classrooms_data = [
        {
            'id': 1,
            'lecture_id': 1,
            'campus': '粤海',
            'building': 'A1楼',
            'room': '101',
            'is_main': True,
            'capacity': 150,
            'remaining': 45
        },
        {
            'id': 2,
            'lecture_id': 1,
            'campus': '粤海',
            'building': 'A1楼',
            'room': '102',
            'is_main': False,
            'capacity': 100,
            'remaining': 20
        },
        {
            'id': 3,
            'lecture_id': 2,
            'campus': '丽湖',
            'building': 'B2楼',
            'room': '201',
            'is_main': True,
            'capacity': 200,
            'remaining': 80
        },
        {
            'id': 4,
            'lecture_id': 3,
            'campus': '粤海',
            'building': 'C3楼',
            'room': '301',
            'is_main': True,
            'capacity': 120,
            'remaining': 30
        },
        {
            'id': 5,
            'lecture_id': 6,
            'campus': '丽湖',
            'building': 'F3楼',
            'room': '301',
            'is_main': True,
            'capacity': 80,
            'remaining': 0
        },
        {
            'id': 6,
            'lecture_id': 6,
            'campus': '丽湖',
            'building': 'F3楼',
            'room': '302',
            'is_main': False,
            'capacity': 60,
            'remaining': 0
        }
    ]
    
    # 用户信息
    user_info = {
        'name': '张同学',
        'online_sessions': 12,
        'offline_sessions': 8,
        'total_progress': 85
    }
    
    # 初始化用户报名状态（默认有两个待参加活动）
    user_enrollment_status = {
        1: {
            'classroom_id': 1,
            'enroll_time': '2025-09-02 10:30:00',
            'seat_number': 'A12'
        },
        3: {
            'classroom_id': 4,
            'enroll_time': '2025-08-26 14:20:00',
            'seat_number': 'B05'
        }
    }

def get_user_enrollments():
    """获取用户报名记录"""
    # 基础报名数据，排除已取消的报名
    base_enrollments = [
        {
            'lecture_id': 1,
            'classroom_id': 1,
            'status': 'enrolled',  # enrolled, attended, absent
            'enroll_time': '2025-09-02 10:30:00',
            'seat_number': 'A12'
        },
        {
            'lecture_id': 3,
            'classroom_id': 4,
            'status': 'enrolled',
            'enroll_time': '2025-08-26 14:20:00',
            'seat_number': 'B05'
        },
        {
            'lecture_id': 5,
            'classroom_id': None,
            'status': 'attended',
            'enroll_time': '2025-08-21 09:15:00',
            'seat_number': 'C08'
        }
    ]
    
    # 过滤掉已取消的报名（即不在user_enrollment_status中的待参加活动）
    active_enrollments = []
    for enrollment in base_enrollments:
        lecture_id = enrollment['lecture_id']
        # 如果是待参加活动（enrolled），检查是否在user_enrollment_status中
        if enrollment['status'] == 'enrolled':
            # 如果不在user_enrollment_status中，说明已被取消，不返回
            if lecture_id not in user_enrollment_status:
                continue
        active_enrollments.append(enrollment)
    
    return active_enrollments

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/lectures')
def get_lectures():
    """获取讲座列表API"""
    filter_type = request.args.get('filter', 'all')
    
    if filter_type == 'enrolling':
        filtered_lectures = [l for l in lectures_data if l['status'] in ['enrolling', 'full']]
    elif filter_type == 'not_started':
        filtered_lectures = [l for l in lectures_data if l['status'] == 'not_started']
    else:
        filtered_lectures = lectures_data
    
    return jsonify(filtered_lectures)

@app.route('/api/classrooms/<int:lecture_id>')
def get_classrooms(lecture_id):
    """获取指定讲座的教室列表"""
    classrooms = [c for c in classrooms_data if c['lecture_id'] == lecture_id]
    return jsonify(classrooms)

@app.route('/api/user/info')
def get_user_info():
    """获取用户信息"""
    return jsonify(user_info)

@app.route('/api/user/enrollments')
def get_user_enrollments_api():
    """获取用户报名信息"""
    enrollments = get_user_enrollments()
    
    # 获取详细的讲座和教室信息
    detailed_enrollments = []
    for enrollment in enrollments:
        lecture = next((l for l in lectures_data if l['id'] == enrollment['lecture_id']), None)
        classroom = next((c for c in classrooms_data if c['id'] == enrollment['classroom_id']), None) if enrollment['classroom_id'] else None
        
        if lecture:
            detailed_enrollment = {
                **enrollment,
                'lecture': lecture,
                'classroom': classroom
            }
            detailed_enrollments.append(detailed_enrollment)
    
    return jsonify(detailed_enrollments)

@app.route('/api/enroll', methods=['POST'])
def enroll_lecture():
    """报名讲座"""
    data = request.get_json()
    lecture_id = data.get('lecture_id')
    classroom_id = data.get('classroom_id')
    
    # 检查是否已经报名
    if lecture_id in user_enrollment_status:
        return jsonify({'success': False, 'message': '您已经报名了该讲座'})
    
    # 更新教室剩余名额
    for classroom in classrooms_data:
        if classroom['id'] == classroom_id:
            if classroom['remaining'] <= 0:
                return jsonify({'success': False, 'message': '该教室已满'})
            classroom['remaining'] -= 1
            break
    
    # 记录用户报名状态
    user_enrollment_status[lecture_id] = {
        'classroom_id': classroom_id,
        'enroll_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'seat_number': f'A{len(user_enrollment_status) + 10}'
    }
    
    return jsonify({'success': True, 'message': '报名成功'})

@app.route('/api/cancel_enroll', methods=['POST'])
def cancel_enroll():
    """取消报名"""
    data = request.get_json()
    lecture_id = data.get('lecture_id')
    
    # 检查是否已报名
    if lecture_id not in user_enrollment_status:
        return jsonify({'success': False, 'message': '您尚未报名该讲座'})
    
    # 获取报名信息
    enrollment_info = user_enrollment_status[lecture_id]
    classroom_id = enrollment_info['classroom_id']
    
    # 恢复教室剩余名额
    for classroom in classrooms_data:
        if classroom['id'] == classroom_id:
            classroom['remaining'] += 1
            break
    
    # 删除用户报名状态
    del user_enrollment_status[lecture_id]
    
    return jsonify({'success': True, 'message': '取消报名成功'})

@app.route('/classroom/<int:lecture_id>')
def classroom_selection(lecture_id):
    """教室选择页面"""
    lecture = next((l for l in lectures_data if l['id'] == lecture_id), None)
    if not lecture:
        return redirect(url_for('index'))
    
    classrooms = [c for c in classrooms_data if c['lecture_id'] == lecture_id]
    return render_template('classroom.html', lecture=lecture, classrooms=classrooms)

@app.route('/profile')
def profile():
    """我的页面"""
    return render_template('profile.html')

@app.route('/history')
def history():
    """历史报名页面"""
    return render_template('history.html')

@app.route('/lecture/<int:lecture_id>')
def lecture_detail(lecture_id):
    """讲座详情页面"""
    lecture = next((l for l in lectures_data if l['id'] == lecture_id), None)
    if not lecture:
        return redirect(url_for('index'))
    
    return render_template('lecture_detail.html', lecture=lecture)

# 初始化数据
init_data()

# Vercel 部署需要的入口点
app_instance = app

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)