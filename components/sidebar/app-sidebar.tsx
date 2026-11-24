"use client";

import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboardIcon,
  BookOpenIcon,
  UsersIcon,
  HomeIcon,
  GraduationCapIcon,
} from "lucide-react";

import Link from "next/link";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  isSuperAdmin?: boolean;
};

export function AppSidebar({
  isSuperAdmin = false,
  ...props
}: AppSidebarProps) {
  const navMain = [
    {
      title: "Visão Geral",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Gerenciar Cursos",
      url: "/admin/courses",
      icon: <BookOpenIcon />,
    },

    ...(isSuperAdmin
      ? [
          {
            title: "Gerenciar Usuários",
            url: "/admin/users",
            icon: <UsersIcon />,
          },
        ]
      : []),

    {
      title: "Meus Cursos",
      url: "/student",
      icon: <GraduationCapIcon />,
    },
    {
      title: "Voltar ao ColaboraEdu",
      url: "/",
      icon: <HomeIcon />,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <GraduationCapIcon className="size-5!" />

                <span className="text-base font-semibold">
                  ColaboraEdu
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}