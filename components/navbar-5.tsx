"use client";

import { MenuIcon } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useIsAdmin } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/ui/language-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar5 = () => {
  const { isSignedIn, user } = useUser();
  const isAdmin = useIsAdmin();
  const { t } = useLanguage();

  return (
    <section className="pointer-events-none">
      <div className="fixed left-1/2 top-6 transform -translate-x-1/2 w-[min(1100px,calc(100%-48px))] rounded-2xl bg-white/60 backdrop-blur-md shadow-2xl border border-white/10 z-50 pointer-events-auto">
        <div className="px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Left: brand */}
            <div className="flex items-center flex-1">
              <Link href="/" className="flex items-center gap-3">
                <span className="text-lg font-hind-siliguri font-medium">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এসো জাপানিজ শিখি' : 'Japanese Shikhi'}
                </span>
              </Link>
            </div>

            {/* Center: nav links */}
            <div className="hidden lg:flex justify-center flex-1">
              <NavigationMenu>
                <NavigationMenuList className="flex items-center gap-2">
                  <NavigationMenuItem>
                    <Link
                      href="/#features"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const element = document.getElementById('features');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          e.preventDefault();
                          window.location.href = '/#features';
                        }
                      }}
                    >
                      {t('nav.features')}
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href="/blog"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                    >
                      Blog
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href="/#courses"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const element = document.getElementById('courses');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          e.preventDefault();
                          window.location.href = '/#courses';
                        }
                      }}
                    >
                      Courses
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href="/#contact"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const element = document.getElementById('contact');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          e.preventDefault();
                          window.location.href = '/#contact';
                        }
                      }}
                    >
                      Contact
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right: actions */}
            <div className="flex justify-end flex-1">
              <div className="hidden lg:flex items-center gap-4">
                <LanguageToggle />
                {isSignedIn ? (
                  <>
                    {isAdmin ? (
                      <Button asChild>
                        <Link href="/admin-dashboard">{t('admin.dashboard')}</Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/dashboard">{t('admin.dashboard')}</Link>
                      </Button>
                    )}
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <Button>{t('nav.startForFree')}</Button>
                  </SignInButton>
                )}
              </div>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MenuIcon className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="max-h-screen overflow-auto">
                    <SheetHeader>
                      <SheetTitle>
                        <Link href="/" className="flex items-center gap-2">
                          <span className="text-lg font-medium font-hind-siliguri">
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এসো জাপানিজ শিখি' : 'Japanese Shikhi'}
                          </span>
                        </Link>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col p-4">
                      <div className="mb-4">
                        <LanguageToggle />
                      </div>

                      <Accordion type="single" collapsible className="mt-4 mb-2">
                        <AccordionItem value="solutions" className="border-none">
                          <AccordionTrigger className="text-base hover:no-underline">
                            <a href="#features" className="w-full">
                              {t('nav.features')}
                            </a>
                          </AccordionTrigger>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex flex-col gap-6 mt-4">
                        <Link href="/blog" className="font-medium">{t('nav.products')}</Link>
                        <Link href="#" className="font-medium">{t('nav.resources')}</Link>
                        <Link href="#" className="font-medium">{t('nav.contact')}</Link>
                      </div>

                      <div className="mt-6 flex flex-col gap-4">
                        {isSignedIn ? (
                          <>
                            {isAdmin ? (
                              <Button asChild variant="outline">
                                <Link href="/admin-dashboard">{t('admin.dashboard')}</Link>
                              </Button>
                            ) : (
                              <Button asChild variant="outline">
                                <Link href="/dashboard">{t('admin.dashboard')}</Link>
                              </Button>
                            )}
                            <div className="flex justify-center">
                              <UserButton
                                appearance={{
                                  elements: {
                                    avatarBox: "w-10 h-10"
                                  }
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <SignInButton mode="modal">
                            <Button>{t('nav.startForFree')}</Button>
                          </SignInButton>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
};
