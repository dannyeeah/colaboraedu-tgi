
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/hooks/use-signout";
import { authClient } from "@/lib/auth-client";
import {
  BookOpenIcon,
  ChevronDownIcon,
  GraduationCapIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
  name: string;
  email: string;
  image: string;
}

export function UserDropdown({
  name,
  email,
  image,
}: UserDropdownProps) {
  const handleSignOut = useSignOut();
  const { data: session } = authClient.useSession();

  const isAdmin = session?.user?.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 p-0 hover:bg-transparent"
        >
          <Avatar>
            <AvatarImage src={image} alt="Foto do perfil" />
            <AvatarFallback>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">
            {name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/">
              <HomeIcon size={16} />
              <span>Início</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/courses">
              <BookOpenIcon size={16} />
              <span>Explorar Cursos</span>
            </Link>
          </DropdownMenuItem>

          {session && (
            <DropdownMenuItem asChild>
              {isAdmin ? (
                <Link href="/admin">
                  <LayoutDashboardIcon size={16} />
                  <span>Painel Administrativo</span>
                </Link>
              ) : (
                <Link href="/student">
                  <GraduationCapIcon size={16} />
                  <span>Meus Cursos</span>
                </Link>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon size={16} />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
