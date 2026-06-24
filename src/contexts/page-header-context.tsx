"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageHeaderContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");

  const value = useMemo(
    () => ({
      title,
      setTitle,
    }),
    [title],
  );

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  }
  return context;
}

export function PageHeaderTitle({ title }: { title: string }) {
  usePageHeaderTitle(title)
  return null
}

export function usePageHeaderTitle(title: string) {
  const { setTitle } = usePageHeader()

  useLayoutEffect(() => {
    setTitle(title)
    return () => setTitle('')
  }, [title, setTitle])
}
