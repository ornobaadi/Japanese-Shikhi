"use client";

import { MenuIcon } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useIsAdmin } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/ui/language-toggle";

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

  const features = [
    {
      title: t('features.interactive.title'),
      description: t('features.interactive.description'),
      href: "#",
    },
    {
      title: t('features.progress.title'),
      description: t('features.progress.description'),
      href: "#",
    },
    {
      title: t('admin.settings'),
      description: t('common.loading'),
      href: "#",
    },
    {
      title: t('footer.community'),
      description: t('footer.help'),
      href: "#",
    },
    {
      title: t('common.upload'),
      description: t('common.download'),
      href: "#",
    },
    {
      title: t('footer.support'),
      description: t('footer.help'),
      href: "#",
    },
  ];

  return (
    <section className="pointer-events-none">
      <div className="fixed left-1/2 top-6 transform -translate-x-1/2 w-[min(1100px,calc(100%-48px))] rounded-2xl bg-white/60 backdrop-blur-md shadow-2xl border border-white/10 z-50 pointer-events-auto">
        <div className="px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Left: brand */}
            <div className="flex items-center flex-1">
              <a href="/" className="flex items-center gap-3">
                <span className="text-lg font-hind-siliguri font-medium">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এসো জাপানিজ শিখি' : 'Japanese Shikhi'}
                </span>
              </a>
            </div>

            {/* Center: nav links */}
            <div className="hidden lg:flex justify-center flex-1">
              <NavigationMenu>
                <NavigationMenuList className="flex items-center gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`${navigationMenuTriggerStyle()} px-3 py-2 rounded-md hover:bg-white/10 transition-colors bg-transparent`}>
                      {t('nav.features')}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[600px] grid-cols-2 p-3">
                        {features.map((feature, index) => (
                          <NavigationMenuLink
                            href={feature.href}
                            key={index}
                            className="rounded-md p-3 transition-colors hover:bg-white/5"
                          >
                            <div>
                              <p className="mb-1 font-semibold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                    >
                      {t('nav.products')}
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                    >
                      {t('nav.resources')}
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      className={`${navigationMenuTriggerStyle()} bg-transparent px-3 py-2 rounded-md hover:bg-white/10 transition-colors`}
                    >
                      {t('nav.contact')}
                    </NavigationMenuLink>
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
                        <a href="/admin-dashboard">{t('admin.dashboard')}</a>
                      </Button>
                    ) : (
                      <Button asChild>
                        <a href="/dashboard">{t('admin.dashboard')}</a>
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
                        <a href="/" className="flex items-center gap-2">
                          <span className="text-lg font-medium font-hind-siliguri">
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এসো জাপানিজ শিখি' : 'Japanese Shikhi'}
                          </span>
                        </a>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col p-4">
                      <div className="mb-4">
                        <LanguageToggle />
                      </div>

                      <Accordion type="single" collapsible className="mt-4 mb-2">
                        <AccordionItem value="solutions" className="border-none">
                          <AccordionTrigger className="text-base hover:no-underline">
                            {t('nav.features')}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid md:grid-cols-2">
                              {features.map((feature, index) => (
                                <a
                                  href={feature.href}
                                  key={index}
                                  className="rounded-md p-3 transition-colors hover:bg-white/5"
                                >
                                  <div>
                                    <p className="mb-1 font-semibold text-foreground">
                                      {feature.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {feature.description}
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex flex-col gap-6 mt-4">
                        <a href="#" className="font-medium">
                          {t('nav.products')}
                        </a>
                        <a href="#" className="font-medium">
                          {t('nav.resources')}
                        </a>
                        <a href="#" className="font-medium">
                          {t('nav.contact')}
                        </a>
                      </div>

                      <div className="mt-6 flex flex-col gap-4">
                        {isSignedIn ? (
                          <>
                            {isAdmin ? (
                              <Button asChild variant="outline">
                                <a href="/admin-dashboard">{t('admin.dashboard')}</a>
                              </Button>
                            ) : (
                              <Button asChild variant="outline">
                                <a href="/dashboard">{t('admin.dashboard')}</a>
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
