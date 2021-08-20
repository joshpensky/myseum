function pages() {
  interface PagesGrid {
    pathname: '/grid';
  }

  function pages_grid() {
    return {
      pathname: '/grid' as const,
    };
  }

  interface PagesIndex {
    pathname: '/';
  }

  function pages_index() {
    return {
      pathname: '/' as const,
    };
  }

  interface PagesMe {
    pathname: '/me';
  }

  function pages_me() {
    return {
      pathname: '/me' as const,
    };
  }

  interface PagesMuseumHey {
    pathname: '/museum/hey';
  }

  function pages_museum_hey() {
    return {
      pathname: '/museum/hey' as const,
    };
  }

  function pages_museum_museumId(museumId: string) {
    interface PagesMuseumAbout {
      pathname: '/museum/[museumId]/about';
      query: {
        museumId: string;
      };
    }

    function pages_museum_about() {
      return {
        pathname: '/museum/[museumId]/about' as const,
        query: {
          museumId,
        },
      };
    }

    interface PagesMuseumCollection {
      pathname: '/museum/[museumId]/collection';
      query: {
        museumId: string;
      };
    }

    function pages_museum_collection() {
      return {
        pathname: '/museum/[museumId]/collection' as const,
        query: {
          museumId,
        },
      };
    }

    interface PagesMuseumIndex {
      pathname: '/museum/[museumId]';
      query: {
        museumId: string;
      };
    }

    function pages_museum_index() {
      return {
        pathname: '/museum/[museumId]' as const,
        query: {
          museumId,
        },
      };
    }

    function pages_museum_gallery(galleryId: string) {
      interface PagesMuseumGalleryIndex {
        pathname: '/museum/[museumId]/gallery/[galleryId]';
        query: {
          museumId: string;
          galleryId: string;
        };
      }

      function pages_museum_gallery_index() {
        return {
          pathname: '/museum/[museumId]/gallery/[galleryId]' as const,
          query: {
            museumId,
            galleryId,
          },
        };
      }

      return {
        index: pages_museum_gallery_index,
      };
    }

    return {
      about: pages_museum_about,
      collection: pages_museum_collection,
      index: pages_museum_index,
      gallery: pages_museum_gallery,
    };
  }

  function pages_museum(): { hey: typeof pages_museum_hey };
  function pages_museum(museumId: string): ReturnType<typeof pages_museum_museumId>;
  function pages_museum(
    museumId?: string,
  ): { hey: typeof pages_museum_hey } | ReturnType<typeof pages_museum_museumId> {
    if (typeof museumId === 'undefined') {
      return {
        hey: pages_museum_hey,
      };
    } else {
      return pages_museum_museumId(museumId);
    }
  }

  function pages_api() {
    interface PagesApiAuth {
      pathname: '/api/auth';
    }

    function pages_api_auth() {
      return {
        pathname: '/api/auth' as const,
      };
    }

    function pages_api_user(userId: string) {
      interface PagesApiUserIndex {
        pathname: '/api/user/[userId]';
        query: {
          userId: string;
        };
      }

      function pages_api_user_index() {
        return {
          pathname: '/api/user/[userId]' as const,
          query: {
            userId,
          },
        };
      }

      return {
        index: pages_api_user_index,
      };
    }

    function pages_api_museum(museumId: string) {
      interface PagesApiMuseumCollection {
        pathname: '/api/museum/[museumId]/collection';
        query: {
          museumId: string;
        };
      }

      function pages_api_museum_collection() {
        return {
          pathname: '/api/museum/[museumId]/collection' as const,
          query: {
            museumId,
          },
        };
      }

      interface PagesApiMuseumIndex {
        pathname: '/api/museum/[museumId]';
        query: {
          museumId: string;
        };
      }

      function pages_api_museum_index() {
        return {
          pathname: '/api/museum/[museumId]' as const,
          query: {
            museumId,
          },
        };
      }

      function pages_api_museum_gallery(galleryId: string) {
        interface PagesApiMuseumGalleryIndex {
          pathname: '/api/museum/[museumId]/gallery/[galleryId]';
          query: {
            museumId: string;
            galleryId: string;
          };
        }

        function pages_api_museum_gallery_index() {
          return {
            pathname: '/api/museum/[museumId]/gallery/[galleryId]' as const,
            query: {
              museumId,
              galleryId,
            },
          };
        }

        return {
          index: pages_api_museum_gallery_index,
        };
      }

      return {
        collection: pages_api_museum_collection,
        index: pages_api_museum_index,
        gallery: pages_api_museum_gallery,
      };
    }

    function pages_api_frames() {
      interface PagesApiFramesIndex {
        pathname: '/api/frames';
      }

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
      interface PagesApiArtworksIndex {
        pathname: '/api/artworks';
      }

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
