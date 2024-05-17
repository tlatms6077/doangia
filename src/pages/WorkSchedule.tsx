import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ButtonGroup, Button } from '@mui/material';
import { Calendar, momentLocalizer,  } from 'react-big-calendar';
import moment from 'moment';
import Timeline from 'react-calendar-timeline';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar-timeline/lib/Timeline.css';
import 'react-calendar/dist/Calendar.css';
import 'moment/locale/vi'; // 베트남어 로캘 추가

moment.locale('vi'); // 기본 로캘을 베트남어로 설정
const localizer = momentLocalizer(moment);

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

const WorkSchedule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<'list' | 'calendar' | 'timeline'>('list');

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL!)
      .then(response => response.json())
      .then(data => {
        if (!data.results) {
          console.error('No results found in the response');
          setData([]);
          return;
        }
        console.log('Fetched Data:', data);
        setData(data.results);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const getStatusClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'status-blue';
      case 'gray':
        return 'status-gray';
      case 'red':
        return 'status-red';
      case 'green':
        return 'status-green';
      default:
        return '';
    }
  };

  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>담당부서</TableCell>
            <TableCell>담당직원명</TableCell>
            <TableCell>담당직원 연락처</TableCell>
            <TableCell>업체명</TableCell>
            <TableCell>업체연락처</TableCell>
            <TableCell>담당업무</TableCell>
            <TableCell>업무시작일</TableCell>
            <TableCell>업무종료일</TableCell>
            <TableCell>상태</TableCell>
            <TableCell>업무중요도</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell>{row.properties?.['담당부서']?.rollup?.array?.[0]?.select?.name ?? ''}</TableCell>
                <TableCell>{row.properties?.['계정']?.rollup?.array?.[0]?.title?.[0]?.text?.content ?? ''}</TableCell>
                <TableCell>{row.properties?.['담당직원 연락처']?.rollup?.array?.[0]?.phone_number ?? ''}</TableCell>
                <TableCell>{row.properties?.['업체명']?.title?.[0]?.text?.content ?? ''}</TableCell>
                <TableCell>{row.properties?.['업체연락처']?.rich_text?.[0]?.plain_text ?? ''}</TableCell>
                <TableCell>{row.properties?.['담당업무내용']?.rich_text?.[0]?.plain_text ?? ''}</TableCell>
                <TableCell>{formatDateTime(row.properties?.['업무시작일']?.date?.start) ?? ''}</TableCell>
                <TableCell>{formatDateTime(row.properties?.['업무종료일']?.date?.start) ?? ''}</TableCell>
                <TableCell>
                  <div className={`status-cell ${getStatusClass(row.properties?.['상태']?.status?.color)}`}>
                    <div className="status-dot"></div>
                    {row.properties?.['상태']?.status?.name ?? ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`status-cell ${getStatusClass(row.properties?.['업무중요도선택']?.select?.color)}`}>
                    <div className="status-dot"></div>
                    {row.properties?.['업무중요도선택']?.select?.name ?? ''}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} align="center">데이터가 없습니다</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
        views={['day', 'week', 'month']} // 'agenda'를 제외한 뷰들만 포함
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        messages={messages} // 베트남어 메시지 설정
      />
    );
  };

  const renderTimelineView = () => {
    if (!data) return null;

    const items = data.map((event: any, index: number) => ({
      id: index,
      group: 1,
      title: event.properties?.['담당업무내용']?.rich_text?.[0]?.plain_text,
      start_time: new Date(event.properties?.['업무시작일']?.date?.start),
      end_time: new Date(event.properties?.['업무종료일']?.date?.start)
    }));

    return (
      <div style={{ height: '500px' }}>
        <Timeline
          groups={[{ id: 1, title: '업무' }]}
          items={items}
          defaultTimeStart={new Date()}
          defaultTimeEnd={new Date(new Date().setDate(new Date().getDate() + 1))}
        />
      </div>
    );
  };

  return (
    <div>
      <ButtonGroup variant="contained">
        <Button onClick={() => setView('list')}>리스트형</Button>
        <Button onClick={() => setView('calendar')}>달력형</Button>
        <Button onClick={() => setView('timeline')}>타임라인형</Button>
      </ButtonGroup>
      {view === 'list' && renderListView()}
      {view === 'calendar' && renderCalendarView()}
      {view === 'timeline' && renderTimelineView()}
    </div>
  );
};

export default WorkSchedule;
