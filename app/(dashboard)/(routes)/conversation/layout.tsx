import { ConversationHistory } from "@/components/conversation-history";

const ConversationLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full relative flex">
      {/* Conversation History Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:right-0 lg:inset-y-0 lg:top-16 z-10">
        <ConversationHistory />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:mr-80">
        {children}
      </div>
    </div>
  );
};

export default ConversationLayout;
