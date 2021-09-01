import React from 'react';
import './notification.css';

interface NotificationProps {
    message: string;
    variant: 'error' | 'info' | 'success';
}

const Notification: React.FC<NotificationProps> = ({ message, variant }) => {
    return <div className={`wallet-notification wallet-notification-${variant}`}>{message}</div>;
};

export default Notification;
