export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-green-400 border-l-2 border-green-400 px-4 py-2 glass rounded-r-lg">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-red-400 border-l-2 border-red-400 px-4 py-2 glass rounded-r-lg">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-gray-300 border-l-2 border-cyan-400 px-4 py-2 glass rounded-r-lg">{message.message}</div>
      )}
    </div>
  );
}
