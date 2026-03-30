import MediaUploadClient from "./media-client";

export const metadata = {
  title: "Medias | Admin",
};

export default function AdminMediaPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <MediaUploadClient />
    </div>
  );
}
