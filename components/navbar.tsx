import { UserButton } from "@clerk/nextjs";

import MobileSidebar from "@/components/mobile-sidebar";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { Badge } from "@/components/ui/badge";

const Navbar = async () => {
  const isPro = await checkSubscription();
  const apiLimitCount = await getApiLimitCount();

  return (
    <div className="flex items-center p-4">
      <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      <div className="flex w-full justify-end items-center gap-x-4">
        {isPro ? (
          <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
            PRO
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {apiLimitCount}/5 Free
          </Badge>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;