import { useState, useEffect, useCallback } from 'react';
import { ticketsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

export const useTickets = (initialFilters = {}) => {
  const { socket } = useSocket();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sort: '-createdAt',
    ...initialFilters,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters };
      // Remove "all" filters
      Object.keys(params).forEach((k) => {
        if (params[k] === 'all' || params[k] === '') delete params[k];
      });
      const { data } = await ticketsAPI.getAll(params);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;
    socket.on('ticket_created', fetchTickets);
    socket.on('ticket_updated', fetchTickets);
    return () => {
      socket.off('ticket_created', fetchTickets);
      socket.off('ticket_updated', fetchTickets);
    };
  }, [socket, fetchTickets]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    total,
    loading,
    error,
    filters,
    setFilter,
    setPage,
    refresh,
    pages: Math.ceil(total / (filters.limit || 10)),
  };
};

export const useTicket = (id) => {
  const { socket } = useSocket();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await ticketsAPI.getOne(id);
      setTicket(data.ticket);
      setComments(data.comments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_ticket', id);

    const onComment = (c) => setComments((prev) => [...prev, c]);
    const onUpdate = (t) => { if (t._id === id) setTicket(t); };

    socket.on('comment_added', onComment);
    socket.on('ticket_updated', onUpdate);

    return () => {
      socket.emit('leave_ticket', id);
      socket.off('comment_added', onComment);
      socket.off('ticket_updated', onUpdate);
    };
  }, [socket, id]);

  return { ticket, comments, setComments, setTicket, loading, error, refresh: fetchTicket };
};
