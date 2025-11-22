"use client";
import { useSignupMutation } from '@/lib/query/authQueries'
import { signupSchema, SignupSchema } from '@/lib/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { useEffect, useState } from 'react';

const SignupForm = () => {
  // const [cooldown, setCooldown] = useState(0);
  const form= useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues:{
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    }
  });

  const signupMutation= useSignupMutation()
  
  const onSubmit= (values: SignupSchema)=>{
    const payload= {name: values.name, email: values.email, password: values.password}
    signupMutation.mutate(payload)
  };

  // useEffect(() => {
  //   if (signupMutation.isSuccess || signupMutation.isError) {
  //     setCooldown(5);
  //   }
  // }, [signupMutation.isSuccess, signupMutation.isError]);

  // useEffect(() => {
  //   if (cooldown <= 0) return;
  //   const i = setInterval(() => setCooldown((n) => n - 1), 1000);
  //   return () => clearInterval(i);
  // }, [cooldown]);

  return (    
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className='w-full max-w-md border rounded-xl p-6 shadow-lg bg-background'>
        <h2 className='text-xl font-semibold mb-4 text-center'> Create An Account </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              {/* Email */}
            <FormField
            control={form.control}
            name="email"
            render={({field})=>(
              <FormItem>
                <FormLabel> Email </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} disabled={signupMutation.isPending}/>
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
                    <Input type="password" placeholder="••••••••" {...field} disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm password" {...field} disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
             type="submit"
             className="w-full"
             disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating Account" : "Sign up"}
            </Button>
          </form>
        </Form>
          {signupMutation.isError && (
            <Button className="mt-3 text-sm text-red-500">
              {signupMutation.isPending  ? "Creating account..." : "Sign up"
              }
            </Button>
          )}
      </div>
    </div>
  )
}

export default SignupForm