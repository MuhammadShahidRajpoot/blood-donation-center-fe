import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Col } from 'react-bootstrap';
import DateRangeSelector from '../../call-center/DateRangePicker/DateRangeSelector';
import { API } from '../../../api/api-routes';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../WebSocketContext/WebSocketContext';

const useGroupNotifications = (notifications, showOnlyUnreadNotifications) => {
  const [groupedNotifications, setGroupedNotifications] = useState({
    today: [],
    yesterday: [],
    older: [],
  });

  useEffect(() => {
    const groupNotifications = () => {
      const today = [];
      const yesterday = [];
      const older = [];

      notifications.forEach((notification) => {
        // If we are showing only unread notifications and this one is read, skip it
        if (showOnlyUnreadNotifications && notification.is_read) {
          return;
        }

        const notificationDate = new Date(notification.created_at);
        if (isToday(notificationDate)) {
          today.push(notification);
        } else if (isYesterday(notificationDate)) {
          yesterday.push(notification);
        } else {
          older.push(notification);
        }
      });

      setGroupedNotifications({ today, yesterday, older });
    };

    groupNotifications();
  }, [notifications, showOnlyUnreadNotifications]);

  return groupedNotifications;
};

const MainNotification = ({ notificationAsPopup, closePopup }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [readChange, setReadChange] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const notificationsRef = useRef(notifications);
  const [totalNotificationsCount, setTotalNotificationsCount] = useState(0);
  const [showUnReadNotifications, setShowUnReadNotifications] = useState(false);

  const socket = useWebSocket();
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data) => {
        const modifiedData = { ...data, is_read: false };
        setNotifications((prevNotifications) => [
          modifiedData,
          ...prevNotifications,
        ]);
      };

      socket.on('notification', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket]);

  const onSelectDate = (date) => {
    setDate(date);
  };

  const markAllAsRead = async () => {
    try {
      await API.notifications.markAllNotificationsAsRead();
      setReadChange(true);
      localStorage.setItem('notification_count', 0);
    } catch (error) {
      toast.error(error?.response, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const markSingleNotificationAsRead = async (id) => {
    try {
      await API.notifications.markSingleNotificationAsRead(id);
      setReadChange(true);
    } catch (error) {
      toast.error(error?.response, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        let query = `page=${pageNo}`;

        if (date) {
          query += `&start_date=${date?.startDate}&end_date=${date?.endDate}`;
        }

        const result = await API.notifications.getAllNotifications(query);
        const { data } = result;

        setTotalNotificationsCount(data?.record_count[0]?.count);

        if (pageNo > 1) {
          setNotifications([...notifications, ...(data?.data || [])]);
        } else {
          setNotifications(data?.data || []);
        }

        setReadChange(false);
      } catch (error) {
        toast.error(error?.response, { autoClose: 3000 });
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [API, readChange, pageNo, date]);

  const getNotificationDate = (date) => {
    const notificationDate = new Date(date);
    if (isToday(notificationDate)) {
      return formatDistanceToNow(notificationDate, { addSuffix: true });
    } else if (isYesterday(notificationDate)) {
      return 'Yesterday';
    } else {
      return format(notificationDate, 'PPP');
    }
  };

  const { today, yesterday, older } = useGroupNotifications(
    notifications,
    showUnReadNotifications
  );

  const showActions = (title) => {
    if (title == 'Today' && today.length > 0) {
      return true;
    } else if (title == 'Yesterday' && today.length <= 0) {
      return true;
    } else if (title == 'Older' && today.length <= 0 && yesterday.length <= 0) {
      return true;
    }
    return false;
  };

  const NotificationSection = ({ title, notifications, isLoading }) => {
    return (
      <div
        style={{
          background: notificationAsPopup ? 'white' : 'transparent',
        }}
      >
        {showActions(title) && notificationAsPopup && (
          <div
            style={{
              padding: notificationAsPopup ? '0.5rem' : '',
            }}
            className={styles.header}
          >
            <div className={styles.title}>Notifications</div>
            {showActions(title) && (
              <div className={styles.actions}>
                <div
                  className={styles.action}
                  style={{ marginRight: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    markAllAsRead();
                  }}
                >
                  Mark all as read
                </div>
                <div
                  style={{ display: 'flex' }}
                  className="form-field checkbox w-100"
                >
                  <div
                    style={{ fontSize: '12px', marginRight: '5px' }}
                    className="toggle-text"
                  >
                    Only show unread
                  </div>
                  <label
                    htmlFor="createmanagescripts_CC-0018_statusToggle"
                    className="switch"
                  >
                    <input
                      type="checkbox"
                      id="createmanagescripts_CC-0018_statusToggle"
                      className="toggle-input"
                      name="is_active"
                      checked={showUnReadNotifications}
                      onChange={(e) => {
                        setShowUnReadNotifications(e.target.checked);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            padding: notificationAsPopup ? '0.5rem' : '',
            borderTop: notificationAsPopup ? '1px solid #000' : '',
            borderBottom: notificationAsPopup ? '1px solid #000' : '',
          }}
          className={styles.header}
        >
          <div className={styles.title}>{title}</div>
          {!notificationAsPopup && showActions(title) && (
            <div className={styles.actions}>
              <div
                className={styles.action}
                style={{ marginRight: '20px', cursor: 'pointer' }}
                onClick={() => {
                  markAllAsRead();
                }}
              >
                Mark all as read
              </div>
              <div
                style={{ display: 'flex' }}
                className="form-field checkbox w-100"
              >
                <div
                  style={{ fontSize: '12px', marginRight: '5px' }}
                  className="toggle-text"
                >
                  Only show unread
                </div>
                <label
                  htmlFor="createmanagescripts_CC-0018_statusToggle"
                  className="switch"
                >
                  <input
                    type="checkbox"
                    id="createmanagescripts_CC-0018_statusToggle"
                    className="toggle-input"
                    name="is_active"
                    checked={showUnReadNotifications}
                    onChange={(e) => {
                      setShowUnReadNotifications(e.target.checked);
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: notificationAsPopup ? '0px' : '15px',
            marginBottom: notificationAsPopup ? '0px' : '15px',
          }}
          className={styles.list}
        >
          {isLoading ? (
            <p className="no-data">Data Loading</p>
          ) : (
            notifications.map((notification) => (
              <div
                onClick={() => {
                  markSingleNotificationAsRead(notification.id);
                  navigate(notification?.actionable_link);
                }}
                key={notification.id}
                className={styles.notification}
              >
                <div className={styles.notificationContent}>
                  <p className={styles.notification_text}>
                    {notification.title}
                    <br /> {notification.content}
                  </p>
                  <span className={styles.notification_timestamp}>
                    {getNotificationDate(notification.created_at)}{' '}
                  </span>
                </div>
                {!notification.is_read && (
                  <div className={styles.radioContainer} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const isThereNoNotifications = () => {
    if (today.length == 0 && yesterday.length == 0 && older.length == 0) {
      return true;
    }
    return false;
  };

  return (
    <div
      style={{ background: notificationAsPopup ? 'white' : 'transparent' }}
      className={styles.notifications}
    >
      {!notificationAsPopup && (
        <form style={{ paddingBottom: 'unset', display: 'flex' }}>
          <div
            className="formGroup w-100 border-0 p-0 mb-20"
            style={{ background: 'none', marginBottom: '20px' }}
          >
            <div className="row row-gap-4 w-100">
              <Col lg={6} sm={12} xs={12}>
                <DateRangeSelector
                  backgroundColor="transparent"
                  onSelectDate={onSelectDate}
                  dateValues={{
                    startDate: date?.startDate,
                    endDate: date?.endDate,
                  }}
                />
              </Col>
            </div>
          </div>
        </form>
      )}

      {isThereNoNotifications() && showUnReadNotifications && (
        <div className={styles.actions}>
          <div
            style={{
              display: 'flex',
              margin: notificationAsPopup ? '20px' : '0px',
              justifyContent: notificationAsPopup ? 'space-between' : 'end',
            }}
            className="form-field checkbox w-100"
          >
            {notificationAsPopup && (
              <div className={styles.title}>Notifications</div>
            )}
            <div
              style={{ fontSize: '12px', marginRight: '5px' }}
              className="toggle-text"
            >
              Only show unread
            </div>
            <label
              htmlFor="createmanagescripts_CC-0018_statusToggle"
              className="switch"
            >
              <input
                type="checkbox"
                id="createmanagescripts_CC-0018_statusToggle"
                className="toggle-input"
                name="is_active"
                checked={showUnReadNotifications}
                onChange={(e) => {
                  setShowUnReadNotifications(e.target.checked);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      )}

      {today.length > 0 && !showUnReadNotifications && (
        <NotificationSection
          title="Today"
          notifications={today}
          isLoading={isLoading}
        />
      )}

      {yesterday.length > 0 && (
        <NotificationSection
          title="Yesterday"
          notifications={yesterday}
          isLoading={isLoading}
        />
      )}

      {older.length > 0 && (
        <NotificationSection
          title="Older"
          notifications={older}
          isLoading={isLoading}
        />
      )}

      {totalNotificationsCount > 0 && !isThereNoNotifications() && (
        <div
          style={{
            borderBottom: notificationAsPopup ? '1px solid #c5c6c6' : '',
          }}
          onClick={() => {
            if (notificationAsPopup) {
              closePopup();
              navigate('/system-configuration/notifications');
            } else {
              setPageNo((pageNo) => {
                return pageNo + 1;
              });
            }
          }}
        >
          <p className={styles.see_more}>See More</p>
        </div>
      )}
    </div>
  );
};

export default MainNotification;
