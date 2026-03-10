"use client";

export default function StickyHeaderWrapper({
  utilityBar,
  announcementBar,
  children,
}: {
  utilityBar?: React.ReactNode;
  announcementBar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Utility bar + Announcement bar */}
      <div>
        {utilityBar}
        {announcementBar}
      </div>
      {/* Main header + category nav */}
      <div className="bg-background">
        {children}
      </div>
    </div>
  );
}
