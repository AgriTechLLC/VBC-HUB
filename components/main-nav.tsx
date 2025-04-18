"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Define the navigation items with submenu structure
const navItems = [
  {
    title: "Bills",
    href: "/bills",
    description: "Track and analyze blockchain legislation",
    subItems: [
      {
        title: "Active Legislation",
        href: "/bills",
        description: "Track current blockchain bills and their status",
      },
      {
        title: "My Bill Tracker",
        href: "/bills/tracker",
        description: "Manage your tracked bills and notifications",
      },
      {
        title: "Bill Comparison",
        href: "/bills/compare",
        description: "Compare different blockchain bills side by side",
      },
      {
        title: "Legislative Archive",
        href: "/bills/archive",
        description: "View past blockchain legislation and outcomes",
      },
    ],
  },
  {
    title: "Education",
    href: "/education",
    description: "Learn about blockchain and legislation",
    subItems: [
      {
        title: "Blockchain Basics",
        href: "/education#blockchain",
        description: "Understand blockchain technology fundamentals",
      },
      {
        title: "Legislative Process",
        href: "/education#process",
        description: "How blockchain bills become law in Virginia",
      },
      {
        title: "Regulatory Landscape",
        href: "/education#landscape",
        description: "Current regulatory environment for blockchain",
      },
      {
        title: "Resources",
        href: "/education/resources",
        description: "White papers, guides and research",
      },
    ],
  },
  {
    title: "Events",
    href: "/events",
    description: "VBC gatherings and blockchain conferences",
  },
  {
    title: "Advocacy",
    href: "/advocacy",
    description: "Get involved in blockchain policy",
    subItems: [
      {
        title: "Action Center",
        href: "/advocacy/action",
        description: "Take action on current blockchain issues",
      },
      {
        title: "Contact Officials",
        href: "/advocacy/contact",
        description: "Connect with your representatives",
      },
      {
        title: "Impact Analysis",
        href: "/advocacy/impact",
        description: "Understand how legislation affects the industry",
      },
    ],
  },
];

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <nav
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2 mr-6">
        <span className="font-bold text-xl">VBC Hub</span>
      </Link>

      {/* Desktop Navigation Menu */}
      <div className="hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.subItems ? (
                  <NavigationMenuTrigger 
                    className={cn(
                      pathname === item.href && "font-medium text-primary"
                    )}
                  >
                    {item.title}
                  </NavigationMenuTrigger>
                ) : (
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        pathname === item.href && "font-medium text-primary"
                      )}
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                )}

                {item.subItems && (
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {item.subItems.map((subItem) => (
                        <ListItem
                          key={subItem.title}
                          title={subItem.title}
                          href={subItem.href}
                          isActive={pathname === subItem.href}
                        >
                          {subItem.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-6 pt-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <span className="font-bold text-xl">VBC Hub</span>
              </Link>
              <div className="grid gap-3">
                {navItems.map((item) => (
                  <div key={item.title} className="space-y-3">
                    <Link
                      href={item.href}
                      className={cn(
                        "block text-base font-medium transition-colors hover:text-primary",
                        pathname === item.href && "text-primary"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                    {item.subItems && (
                      <div className="grid gap-1 pl-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className={cn(
                              "block text-sm transition-colors hover:text-primary",
                              pathname === subItem.href && "text-primary"
                            )}
                            onClick={() => setOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// Navigation menu list item component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { isActive?: boolean }
>(({ className, title, children, isActive, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isActive && "bg-accent",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});