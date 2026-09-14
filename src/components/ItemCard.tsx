import { LostFoundItem } from "@/types";

export default function ItemCard({ item }: { item: LostFoundItem }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.type === "lost"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {item.type === "lost" ? "Lost" : "Found"}
        </span>
        <span className="text-xs text-gray-400">{item.status}</span>
      </div>

      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-40 object-cover rounded-md"
        />
      )}

      <h3 className="font-medium">{item.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
      <p className="text-xs text-gray-400">by {item.reportedBy}</p>
    </div>
  );
}