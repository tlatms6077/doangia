import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, CardContent, Typography, Chip, Modal, TextField, Alert } from '@mui/material';
import { Calendar, momentLocalizer, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import { useSwipeable } from 'react-swipeable';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar/dist/Calendar.css';
import 'moment/locale/vi';
import '../css/MobileWorkSchedule.css';
import '../css/react-big-calendar.css';
import axios from 'axios';
import { styled } from '@mui/system';

moment.locale('vi');
const localizer = momentLocalizer(moment);

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

const customFormats = {
  dayHeaderFormat: (date: Date, culture?: string, localizer?: any) =>
    localizer.format(date, 'dddd', culture) + ' / ' + localizer.format(date, 'DD', culture), // 요일 / 일

  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) => {
    let startFormat = localizer.format(start, 'DD', culture);
    let endFormat = localizer.format(end, 'DD', culture);
    let monthYearFormat = localizer.format(start, 'MMMM', culture);
    return `${startFormat}-${endFormat} / THÁNG ${monthYearFormat}`; // '13-19 / THÁNG 5'
  },

  dayFormat: (date: Date, culture?: string, localizer?: any) =>
    localizer.format(date, 'dd', culture).toUpperCase() + ' / ' + localizer.format(date, 'DD', culture), // 'T2 / 13'
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
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [date, setDate] = useState(new Date());
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 중복 요청 방지용 상태

  const handleEmailSubmit = () => {
    if (!loading) {
      fetchData();
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.REACT_APP_API_URL_PRODUCTION 
      : process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      setError('API URL이 설정되지 않았습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(apiUrl, { email });
      setData(response.data.results);
            console.log('Fetched data:', response.data); // 데이터를 콘솔에 출력

      setError(null); // Clear any previous error
      setIsLoggedIn(true); // Only log in if data fetch is successful
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
      setIsLoggedIn(false); // Keep user logged out if there is an error
    } finally {
      setLoading(false); // 요청 완료 후 로딩 상태 해제
    }
  }, [email]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, fetchData]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      switch (calendarView) {
        case 'day':
          setDate(new Date(moment(date).add(1, 'day').toISOString()));
          break;
        case 'week':
          setDate(new Date(moment(date).add(1, 'week').toISOString()));
          break;
        case 'month':
          setDate(new Date(moment(date).add(1, 'month').toISOString()));
          break;
        default:
          break;
      }
    },
    onSwipedRight: () => {
      switch (calendarView) {
        case 'day':
          setDate(new Date(moment(date).subtract(1, 'day').toISOString()));
          break;
        case 'week':
          setDate(new Date(moment(date).subtract(1, 'week').toISOString()));
          break;
        case 'month':
          setDate(new Date(moment(date).subtract(1, 'month').toISOString()));
          break;
        default:
          break;
      }
    },
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
        view={calendarView}
        onView={(newView) => setCalendarView(newView as 'day' | 'week' | 'month')}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        messages={messages}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        components={{ toolbar: CustomToolbar }}
        formats={customFormats}

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
              disabled={!email.trim() || loading} // 이메일이 공백이거나 로딩 중일 때 버튼 비활성화
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

