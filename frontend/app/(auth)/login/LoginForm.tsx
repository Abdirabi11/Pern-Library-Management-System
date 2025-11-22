"use client";
import { Button } from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/lib/query/authQueries';
import { loginSchema, LoginSchema } from '@/lib/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export function LoginForm(){
    const form= useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const loginMutation= useLoginMutation();

    const onSubmit= (values: LoginSchema)=>{
        loginMutation.mutate(values, {
            onError: (err: any)=>{
                toast.error(err?.response?.data?.message || "Login failed");
            },
            onSuccess: () => {
                toast.success("Logged in successfully");
            },
        })
    }
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
        <div className='w-full max-w-md border rounded-xl p-6 shadow-lg bg-background'>
            <h1 className='text-2-xl font-semibold mb-6 text-center'>Login</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email */}
                    <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="email@example.com" {...field} disabled={loginMutation.isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                     )}
                    />
                    {/* Password */}
                    <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} disabled={loginMutation.isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                     )}
                    />

                    <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Logging in…" : "Login"}
                    </Button>
                </form>
            </Form>
        </div>
    </div>
  )
};