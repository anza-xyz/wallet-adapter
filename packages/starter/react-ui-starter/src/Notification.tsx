import React, { FC } from 'react';
import './notification.css';

export interface NotificationProps {
    message: string;
    variant: 'error' | 'info' | 'success';
}

const Notification: FC<NotificationProps> = ({ message, variant }) => {
    return <div className={`wallet-notification wallet-notification-${variant}`}>{message}</div>;
};

export default Notification;
