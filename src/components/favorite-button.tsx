import { toggleFavoriteAction } from "@/lib/actions";

type FavoriteButtonProps = {
  careHomeId: string;
  isFavorite: boolean;
};

export function FavoriteButton({ careHomeId, isFavorite }: FavoriteButtonProps) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="careHomeId" value={careHomeId} />
      <button className="button" type="submit">
        {isFavorite ? "Remove favorite" : "Save favorite"}
      </button>
    </form>
  );
}
