import React from "react";

type AuthShellProps = {
  imageUrl: string;
  children: React.ReactNode;
};

export default function AuthShell({ imageUrl, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.7fr_0.9fr]">
        <div
          className="hidden lg:block bg-center bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px] rounded-sm bg-white px-10 py-12 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}