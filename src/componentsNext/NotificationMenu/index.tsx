import {
  Notification,
  NotificationClose,
  NotificationLoading,
  NotificationMenuSeparator,
  NotificationMessage,
  NotificationTitle,
} from "~/design/Notification/";

import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { twMergeClsx } from "~/util/helpers";
import { useNamespace } from "~/util/store/namespace";
import { useNamespaceLinting } from "~/api/namespaceLinting/query/useNamespaceLinting";
import { useNotificationConfig } from "./config";
import { useTranslation } from "react-i18next";

interface NotificationMenuProps {
  className?: string;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useNamespaceLinting();
  const notificationConfig = useNotificationConfig();
  const showIndicator = !!data?.issues.length;

  const textLoading = t("components.notificationMenu.isLoading.description");
  const textNoIssues = t("components.notificationMenu.noIssues.description");
  const title = t("components.notificationMenu.title");

  const namespace = useNamespace();
  if (!namespace) return null;

  const possibleNotifications = Object.entries(notificationConfig ?? {});

  return (
    <div className={twMergeClsx("self-end text-right", className)}>
      <Notification showIndicator={showIndicator}>
        <NotificationTitle>{title}</NotificationTitle>
        <NotificationMenuSeparator />
        {isLoading && <NotificationLoading>{textLoading}</NotificationLoading>}
        {showIndicator && (
          <div>
            {possibleNotifications.map(
              ([notificationType, notificationConfig], index, srcArr) => {
                const isLast = index === srcArr.length - 1;
                const matchingNotification = data.issues.filter(
                  (issue) => notificationType === issue.type
                );
                if (matchingNotification.length <= 0) {
                  return null;
                }
                return (
                  <div key={notificationType}>
                    <NotificationClose
                      className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3"
                      asChild
                    >
                      <Link to={notificationConfig.href}>
                        <NotificationMessage
                          text={notificationConfig.description(
                            matchingNotification.length
                          )}
                          icon={notificationConfig.icon}
                        />
                      </Link>
                    </NotificationClose>
                    {!isLast && <NotificationMenuSeparator />}
                  </div>
                );
              }
            )}
          </div>
        )}
        {!showIndicator && (
          <NotificationMessage
            text={textNoIssues}
            icon={Check}
          ></NotificationMessage>
        )}
      </Notification>
    </div>
  );
};

export default NotificationMenu;
