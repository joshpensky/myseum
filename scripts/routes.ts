function pages() {
  function pages_grid() {
    return {
      pathname: '/grid' as const,
    };
  }

  function pages_index() {
    return {
      pathname: '/' as const,
    };
  }

  function pages_me() {
    return {
      pathname: '/me' as const,
    };
  }

  function pages_museum() {
    function pages_museum_hey() {
      return {
        pathname: '/museum/hey' as const,
      };
    }

    return {
      hey: pages_museum_hey,
    };
  }

  function pages_api() {
    function pages_api_auth() {
      return {
        pathname: '/api/auth' as const,
      };
    }

    function pages_api_user(userId: string) {
      function pages_api_user_userId_index() {
        return {
          pathname: '/api/user/[userId]' as const,
          query: {
            userId,
          },
        };
      }

      return {
        index: pages_api_user_userId_index,
      };
    }

    function pages_api_museum(museumId: string) {
      function pages_api_museum_museumId_collection() {
        return {
          pathname: '/api/museum/[museumId]/collection' as const,
          query: {
            museumId,
          },
        };
      }

      function pages_api_museum_museumId_index() {
        return {
          pathname: '/api/museum/[museumId]' as const,
          query: {
            museumId,
          },
        };
      }

      function pages_api_museum_museumId_gallery(galleryId: string) {
        function pages_api_museum_museumId_gallery_galleryId_index() {
          return {
            pathname: '/api/museum/[museumId]/gallery/[galleryId]' as const,
            query: {
              museumId,
              galleryId,
            },
          };
        }

        return {
          index: pages_api_museum_museumId_gallery_galleryId_index,
        };
      }

      return {
        collection: pages_api_museum_museumId_collection,
        index: pages_api_museum_museumId_index,
        gallery: pages_api_museum_museumId_gallery,
      };
    }

    function pages_api_frames() {
      function pages_api_frames_index() {
        return {
          pathname: '/api/frames' as const,
        };
      }

      return {
        index: pages_api_frames_index,
      };
    }

    function pages_api_artworks() {
      function pages_api_artworks_index() {
        return {
          pathname: '/api/artworks' as const,
        };
      }

      return {
        index: pages_api_artworks_index,
      };
    }

    return {
      auth: pages_api_auth,
      user: pages_api_user,
      museum: pages_api_museum,
      frames: pages_api_frames,
      artworks: pages_api_artworks,
    };
  }

  return {
    grid: pages_grid,
    index: pages_index,
    me: pages_me,
    museum: pages_museum,
    api: pages_api,
  };
}

export { pages };
