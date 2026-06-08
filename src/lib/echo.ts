import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axiosInstance from './axios';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',

    key: import.meta.env.VITE_REVERB_APP_KEY,

    wsHost: import.meta.env.VITE_REVERB_HOST,

    wsPort: Number(
        import.meta.env.VITE_REVERB_PORT
    ),

    forceTLS: false,

    enabledTransports: ['ws', 'wss'],

    authorizer: (channel: any, options: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                axiosInstance.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
});

export default echo;