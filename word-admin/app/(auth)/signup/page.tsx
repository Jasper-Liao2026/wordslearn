import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPageGuard } from "@/components/auth/auth-page-guard";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "注册系统管理员 · WordsLearn 管理后台",
};

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthPageGuard mode="signup" />
      </Suspense>
      <AuthShell
        title="注册系统管理员"
        description="首次使用请创建系统管理员账号，创建后将关闭注册入口。"
      >
        <SignUpForm />
      </AuthShell>
    </>
  );
}
