import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, CardContent, Typography, Chip, Modal, TextField, Alert } from '@mui/material';
import { Calendar, momentLocalizer, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import { useSwipeable } from 'react-swipeable';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar/dist/Calendar.css';
import 'moment/locale/vi'; // 베트남어 로캘 추가
import '../css/MobileWorkSchedule.css'; // 모바일 스타일링을 위한 CSS 파일 추가
import '../css/react-big-calendar.css';
import axios from 'axios';
import { styled } from '@mui/system';

moment.locale('vi'); // 기본 로캘을 베트남어로 설정
const localizer = momentLocalizer(moment);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/notion-data';

const CustomToolbar: React.FC<ToolbarProps> = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
      <button type="button" onClick={() => onNavigate('TODAY')}>Today</button> 
      <button type="button" onClick={() => onView('day')}>Day</button>
      <button type="button" onClick={() => onView('week')}>Week</button>
      <button type="button" onClick={() => onView('month')}>Month</button>
      </span>
    </div>
  );
};

const messages = {
  allDay: 'Cả ngày',
  previous: 'Trước',
  next: 'Tiếp',
  today: 'Hôm nay',
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
  agenda: 'Lịch trình',
  date: 'Ngày',
  time: 'Thời gian',
  event: 'Sự kiện',
  noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này.',
  showMore: (total: number) => `+ thêm ${total}`,
};

const formatDateTime = (dateTime: string) => {
  return moment(dateTime).format('HH:mm DD/MM/YYYY');
};

const StyledButton = styled(Button)(({ theme }) => ({
  '&.Mui-disabled': {
    backgroundColor: '#3F3A77',
    color: '#FFF',
    opacity: 0.5,
  },
}));

const MobileWorkSchedule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [date, setDate] = useState(new Date());
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleEmailSubmit = () => {
    fetchData();
  };
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(API_URL, { email });
      setData(response.data.results);
      setError(null);
      setIsLoggedIn(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          setError('잘못된 이메일입니다. 다시 입력해주세요.');
        } else {
          setError('데이터를 가져오는 중 오류가 발생했습니다.');
        }
      } else {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      }
      setIsLoggedIn(false);
    }
  }, [email]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, fetchData]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setDate(new Date(moment(date).add(view === 'calendar' ? 1 : 1, 'month').toISOString())),
    onSwipedRight: () => setDate(new Date(moment(date).subtract(view === 'calendar' ? 1 : 1, 'month').toISOString())),
  });

  const renderCalendarView = () => {
    if (!data) return null;

    const events = data.map((event: any) => ({
      id: event.id,
      title: event.properties?.['담당업무내용']?.rich_text?.[0]?.plain_text,
      start: new Date(event.properties?.['업무시작일']?.date?.start),
      end: new Date(event.properties?.['업무종료일']?.date?.start)
    }));

    return (
      <Calendar
        localizer={localizer}
        events={events}
        views={['day', 'week', 'month']}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        messages={messages}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        components={{ toolbar: CustomToolbar }}
      />
    );
  };

  const renderListView = () => {
    if (!data) return null;

    return (
      <div className="list-view">
        {data.map((row: any) => (
          <Card key={row.id} className="list-card">
            <CardContent>
              <Typography variant="h6">{row.properties?.['업체명']?.title?.[0]?.text?.content ?? ''}</Typography>
              <Typography variant="body2" color="textSecondary">{row.properties?.['담당업무내용']?.rich_text?.[0]?.plain_text ?? ''}</Typography>
              <Typography variant="body2" color="textSecondary">{formatDateTime(row.properties?.['업무시작일']?.date?.start) ?? ''} - {formatDateTime(row.properties?.['업무종료일']?.date?.end) ?? ''}</Typography>
              <Typography variant="body2" color="textSecondary">{row.properties?.['업체연락처']?.rich_text?.[0]?.plain_text ?? ''}</Typography>
              <Chip label={row.properties?.['업무중요도선택']?.select?.name ?? ''} className={`status-${row.properties?.['업무중요도선택']?.select?.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div {...handlers}>
      {!isLoggedIn && (
        <Modal open={!isLoggedIn}>
          <div className="modal-content">
            <h2>Doangia</h2>
            <span>이메일을 입력해주세요</span>
            {error && <Alert severity="error">{error}</Alert>} {/* 오류 메시지 표시 */}
            <div className="emailTyping">
              <TextField
                type="email"
                label="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </div>
            <StyledButton
              onClick={handleEmailSubmit}
              variant="contained"
              style={{ backgroundColor: '#3F3A77', color: '#FFF' }}
              fullWidth
              disabled={!email.trim()} // 이메일이 공백일 때 버튼 비활성화
            >
              로그인
            </StyledButton>
          </div>
        </Modal>
      )}
      {isLoggedIn && (
        <>
          <Button onClick={() => setView('calendar')}>달력형</Button>
          <Button onClick={() => setView('list')}>리스트형</Button>
          {view === 'calendar' && renderCalendarView()}
          {view === 'list' && renderListView()}
        </>
      )}
    </div>
  );
};

export default MobileWorkSchedule;
