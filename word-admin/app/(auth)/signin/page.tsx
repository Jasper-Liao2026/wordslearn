import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPageGuard } from "@/components/auth/auth-page-guard";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "登录 · WordsLearn 管理后台",
};

export default function SignInPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthPageGuard mode="signin" />
      </Suspense>
      <AuthShell
        title="登录管理后台"
        description="使用管理员邮箱和密码登录，管理单词书与后台账号。"
      >
        <SignInForm />
      </AuthShell>
    </>
  );
}
