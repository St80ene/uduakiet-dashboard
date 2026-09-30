import type { IBasePaginationParams } from '@/interfaces';
import {
  createSupplier,
  getAllSuppliers,
  getSupplierByID,
  removeSupplier,
  updateSupplier,
} from '@/services/suppliers.service.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const SUPPLIERS_QUERY_KEY = ['suppliers'];

export const useGetSuppliers = ({
  page,
  limit,
  search,
  order,
}: IBasePaginationParams) => {
  return useQuery({
    queryKey: [...SUPPLIERS_QUERY_KEY, { page, limit, search, order }], // Spread it here
    queryFn: () => getAllSuppliers({ page, limit, search, order }),
  });
};

export const useGetSupplier = (id: string) => {
  return useQuery({
    queryKey: [...SUPPLIERS_QUERY_KEY, id],
    queryFn: () => getSupplierByID(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...SUPPLIERS_QUERY_KEY, data.data?.id],
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
};
