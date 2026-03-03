/**
 * 이벤트 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';
import type { EventFormData, EventListParams, EventStatus } from '@/types/event';

export function useEventList(params?: EventListParams) {
  return useQuery({
    queryKey: ['events', 'list', params],
    queryFn: () => eventService.getEvents(params),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      existingStatus,
    }: {
      id: string;
      data: EventFormData;
      existingStatus?: EventStatus;
    }) => eventService.updateEvent(id, data, existingStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.duplicateEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useEventStatsOverview() {
  return useQuery({
    queryKey: ['events', 'stats'],
    queryFn: () => eventService.getStatsOverview(),
  });
}

export function useEventParticipants(
  eventId: string | undefined,
  params?: { keyword?: string; actionType?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['event-participants', eventId, params],
    queryFn: () => eventService.getParticipants(eventId!, params),
    enabled: !!eventId,
  });
}
