import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { eventsApi, attendancesApi } from '../services/api';
import { AttendanceCreate, AttendanceWithUser } from '../types';

const attendanceSchema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe'], {
    required_error: '出欠状況を選択してください',
  }),
  comment: z.string().optional(),
});

type AttendanceFormData = {
  status: 'attending' | 'not_attending' | 'maybe';
  comment?: string;
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  const { data: event, isLoading, error: eventError } = useQuery(
    ['event', id],
    () => eventsApi.getEvent(id!),
    {
      enabled: !!id,
    }
  );

  const { data: attendances, isLoading: attendancesLoading } = useQuery(
    ['attendances', id],
    () => attendancesApi.getEventAttendances(id!),
    {
      enabled: !!id,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  const createAttendanceMutation = useMutation(attendancesApi.createAttendance, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attendances', id]);
      queryClient.invalidateQueries(['event', id]);
      setShowAttendanceForm(false);
      reset();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '出欠登録に失敗しました');
    },
  });

  const updateAttendanceMutation = useMutation(
    ({ attendanceId, data }: { attendanceId: string; data: Partial<AttendanceFormData> }) =>
      attendancesApi.updateAttendance(attendanceId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['attendances', id]);
        queryClient.invalidateQueries(['event', id]);
        setShowAttendanceForm(false);
        reset();
      },
      onError: (err: any) => {
        setError(err.response?.data?.detail || '出欠更新に失敗しました');
      },
    }
  );

  const deleteEventMutation = useMutation(eventsApi.deleteEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('events');
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'イベントの削除に失敗しました');
    },
  });

  const onSubmitAttendance = async (data: AttendanceFormData) => {
    if (!id) return;
    
    setError('');
    const myAttendance = attendances?.find(a => a.user.id === user?.id);
    
    if (myAttendance) {
      updateAttendanceMutation.mutate({
        attendanceId: myAttendance.id,
        data,
      });
    } else {
      createAttendanceMutation.mutate({
        event_id: id,
        status: data.status,
        comment: data.comment,
      });
    }
  };

  const handleDeleteEvent = () => {
    if (window.confirm('本当にこのイベントを削除しますか？')) {
      deleteEventMutation.mutate(id!);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attending': return '参加';
      case 'not_attending': return '不参加';
      case 'maybe': return '未定';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800';
      case 'not_attending': return 'bg-red-100 text-red-800';
      case 'maybe': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">イベントが見つかりません</div>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  const myAttendance = attendances?.find(a => a.user.id === user?.id);
  const isCreator = event.creator_id === user?.id;
  const attendingCount = attendances?.filter(a => a.status === 'attending').length || 0;
  const notAttendingCount = attendances?.filter(a => a.status === 'not_attending').length || 0;
  const maybeCount = attendances?.filter(a => a.status === 'maybe').length || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                出欠管理アプリ
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}さん</span>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* イベント情報 */}
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{format(new Date(event.event_date), 'yyyy年MM月dd日 HH:mm')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>作成者: {event.creator.name}</span>
                  </div>
                </div>
                {isCreator && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteEvent}
                      disabled={deleteEventMutation.isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {deleteEventMutation.isLoading ? '削除中...' : '削除'}
                    </button>
                  </div>
                )}
              </div>
              
              {event.description && (
                <div className="mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 出欠登録 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">出欠登録</h2>
                
                {myAttendance && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">現在の出欠状況:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(myAttendance.status)}`}>
                        {getStatusText(myAttendance.status)}
                      </span>
                    </div>
                    {myAttendance.comment && (
                      <p className="mt-2 text-sm text-blue-600">コメント: {myAttendance.comment}</p>
                    )}
                  </div>
                )}

                {!showAttendanceForm ? (
                  <button
                    onClick={() => {
                      setShowAttendanceForm(true);
                      if (myAttendance) {
                        reset({
                          status: myAttendance.status,
                          comment: myAttendance.comment || '',
                        });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {myAttendance ? '出欠を変更する' : '出欠を登録する'}
                  </button>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitAttendance)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        出欠状況 <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            {...register('status')}
                            type="radio"
                            value="attending"
                            className="mr-2"
                          />
                          <span className="text-green-700">参加</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            {...register('status')}
                            type="radio"
                            value="not_attending"
                            className="mr-2"
                          />
                          <span className="text-red-700">不参加</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            {...register('status')}
                            type="radio"
                            value="maybe"
                            className="mr-2"
                          />
                          <span className="text-yellow-700">未定</span>
                        </label>
                      </div>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                        コメント
                      </label>
                      <textarea
                        {...register('comment')}
                        id="comment"
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="何かコメントがあれば..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={createAttendanceMutation.isLoading || updateAttendanceMutation.isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        {createAttendanceMutation.isLoading || updateAttendanceMutation.isLoading
                          ? '保存中...'
                          : '保存'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttendanceForm(false);
                          reset();
                          setError('');
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* 出欠状況統計 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">出欠状況</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      参加
                    </span>
                    <span className="font-medium">{attendingCount}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      不参加
                    </span>
                    <span className="font-medium">{notAttendingCount}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      未定
                    </span>
                    <span className="font-medium">{maybeCount}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 参加者一覧 */}
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">参加者一覧</h2>
              {attendancesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : attendances && attendances.length > 0 ? (
                <div className="space-y-3">
                  {attendances.map((attendance: AttendanceWithUser) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getStatusColor(attendance.status)}`}>
                            {attendance.status === 'attending' ? '参' : attendance.status === 'not_attending' ? '不' : '未'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {attendance.user.name}
                            {attendance.user.id === user?.id && (
                              <span className="ml-2 text-xs text-blue-600">(あなた)</span>
                            )}
                          </p>
                          {attendance.comment && (
                            <p className="text-xs text-gray-500">{attendance.comment}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        {getStatusText(attendance.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  まだ誰も出欠登録していません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;