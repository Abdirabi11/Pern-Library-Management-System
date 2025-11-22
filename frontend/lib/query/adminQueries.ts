import { adminService } from "@/services/admin.service";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const adminKeys = {
    root: ["admin"] as const,
  
    // USERS
    users: (page: number, limit: number) => ["admin", "users", page, limit] as const,
    user: (uuid: string) => ["admin", "user", uuid] as const,
  
    // REQUESTS
    requests: (page?: number, limit?: number) =>
      page && limit
        ? ["admin", "requests", page, limit] as const
        : ["admin", "requests"] as const,
  
    request: (uuid: string) => ["admin", "request", uuid] as const,
  
    // LOGS
    logs: (page: number, limit: number) => ["admin", "logs", page, limit] as const,
    log: (uuid: string) => ["admin", "log", uuid] as const,
};

function handleError(err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
    toast.error(msg);
};
  
export function prefetchAdminUsers(qc: QueryClient, page = 1, limit = 50) {
    return qc.prefetchQuery({
      queryKey: adminKeys.users(page, limit),
      queryFn: () => adminService.getUsers(page, limit),
    });
};

export function useUsersQuery(page=1, limit=50){
    return useQuery({
        queryKey: adminKeys.users(page, limit),
        queryFn: () => adminService.getUsers(page, limit),
        keepPreviousData: true,
        onError: handleError,
    });
};

export function useUserQuery(uuid?:string){
    return useQuery({
        queryKey: uuid ? adminKeys.user(uuid) : undefined,
        queryFn: () => adminService.getUser(uuid!),
        enabled: !!uuid,
        onError: handleError,
    })
};

export function useUpdateUserRoleMutation(){
    const qc= useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, role }: { uuid: string; role: string }) => adminService.updateUserRole(uuid, role),
        onSuccess: ()=>{
            qc.invalidateQueries(adminKeys.root);
            qc.invalidateQueries({ queryKey: adminKeys.users(1, 50) });
        },
        onError: handleError,
    })
};

export function useCreateUserMutation(){
    const qc= useQueryClient()
    return useMutation({
        mutationFn: (payload: { name: string; email: string; role: string; password?: string }) =>
          adminService.createUser(payload),
        onSuccess: () => qc.invalidateQueries(adminKeys.users(1, 50)),
        onError: handleError,
    });
};

export function useDeleteUserMutation(){
    const qc= useQueryClient();
    return useMutation({
        mutationFn: (uuid: string)=> adminService.deleteUser(uuid),
        onSuccess: ()=> qc.invalidateQueries(adminKeys.users(1, 50)),
        onError: handleError,
    })
};

export function useAdminRequestsQuery(uuid?: string){
    return useQuery({
        queryKey: uuid ? adminKeys.request(uuid) : undefined,
        queryFn: () => adminService.getRequest(uuid!),
        enabled: !!uuid,
        onError: handleError,
    });
};

export function useAdminRequestsListQuery(page = 1, limit = 50) {
    return useQuery({
      queryKey: adminKeys.requests(page, limit),
      queryFn: () => adminService.listAllRequests(page, limit),
      keepPreviousData: true,
      onError: handleError,
    });
};

export function useApproveRequestMutation(){
    const qc= useQueryClient();
    return useMutation({
        mutationFn:  (uuid: string) => adminService.approveRequest(uuid),
        onSuccess: ()=> {
            qc.invalidateQueries(adminKeys.requests());
            qc.invalidateQueries(["books"]);
        },
        onError: handleError,
    })
};

export function useRejectRequestMutation(uuid: string){
    const qc= useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, remarks }: { uuid: string; remarks?: string }) => adminService.rejectRequest(uuid, remarks),
        onSuccess: () => qc.invalidateQueries(adminKeys.requests()),
        onError: handleError,
    })
};

export function useRevokeRequestMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (uuid: string) => adminService.revokeRequest(uuid),
      onSuccess: () => {
        qc.invalidateQueries(adminKeys.requests());
        qc.invalidateQueries(["books"]);
      },
      onError: handleError,
    });
};

export function useAdminLogsQuery(page = 1, limit = 50){
    return useQuery({
        queryKey: adminKeys.logs(page, limit),
        queryFn: () => adminService.getLogs(page, limit),
        keepPreviousData: true,
        onError: handleError,
    })
};

export function useAdminLogQuery(uuid: string){
    return useQuery({
        queryKey: adminKeys.log(uuid),
        queryFn: () => adminService.getLog(uuid),
        enabled: !!uuid,
        onError: handleError,
    });
};