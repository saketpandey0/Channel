import React, { createContext, useContext, useReducer, type ReactNode } from "react";

interface BookmarkData {
  bookmarked: boolean;
}

interface BookmarkState {
  [storyId: string]: BookmarkData;
}

type BookmarkAction =
  | { type: "SET_BOOKMARK"; storyId: string; bookmarked: boolean }
  | { type: "TOGGLE_BOOKMARK"; storyId: string }
  | { type: "SET_BATCH_BOOKMARKS"; data: Record<string, BookmarkData> };

const bookmarkReducer = (state: BookmarkState, action: BookmarkAction): BookmarkState => {
  switch (action.type) {
    case "SET_BOOKMARK":
      return {
        ...state,
        [action.storyId]: { bookmarked: action.bookmarked },
      };

    case "TOGGLE_BOOKMARK":
      return {
        ...state,
        [action.storyId]: {
          bookmarked: !state[action.storyId]?.bookmarked,
        },
      };

    case "SET_BATCH_BOOKMARKS":
      return {
        ...state,
        ...action.data,
      };

    default:
      return state;
  }
};

const BookmarkContext = createContext<{
  bookmarks: BookmarkState;
  dispatch: React.Dispatch<BookmarkAction>;
} | null>(null);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarks, dispatch] = useReducer(bookmarkReducer, {});

  return (
    <BookmarkContext.Provider value={{ bookmarks, dispatch }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarkContext = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarkContext must be used within BookmarkProvider");
  }
  return context;
};
