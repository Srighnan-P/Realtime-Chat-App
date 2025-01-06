import {create} from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from '../lib/axios';
import {useAuthStore} from '../store/useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    showOnlineOnly: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        try {
            console.log(messageData);
            
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || "Failed to send message");
        }
    },

    subMessages: () => {
        const {selectedUser} = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({ 
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user) => {
        set({ selectedUser: user });
        
    },
    setShowOnlineOnly: (value) => {
        set({ showOnlineOnly: value });
    },


}));