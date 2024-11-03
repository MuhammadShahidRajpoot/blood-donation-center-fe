import { API } from '../api/api-routes';
const handleSendNotification = async (
  title,
  content,
  organizational_level,
  module,
  actionable_link,
  user_id,
  target_type_id,
  target_type
) => {
  const body = {
    title,
    content,
    organizational_level,
    module,
    actionable_link,
    user_id,
    target_type_id,
    target_type,
  };
  const response = await API.Notification.send(body);
  return response?.data;
};

export default handleSendNotification;
