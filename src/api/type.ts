import { GetServerSidePropsContext } from 'next';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';

export interface MyseumAPI {
  auth: {
    /**
     * Gets a user based on SSR context.
     *
     * @param context the Next.js SSR context
     * @return the user attached to the cookie, or null if none
     */
    findUserByCookie(context: GetServerSidePropsContext): Promise<UserDto | null>;
  };

  gallery: {
    /**
     * Finds all galleries within a given museum.
     *
     * @param museum the museum to search within
     * @return the museum's galleries
     */
    findAllByMuseum(museum: MuseumDto): Promise<GalleryDto[]>;

    findOneByMuseum(museumId: string, galleryId: string): Promise<GalleryDto | null>;
  };

  museum: {
    /**
     * Finds a musuem for a given curator.
     *
     * @param curator the museum's curator
     * @return the curator's museum
     */
    findOneByCurator(curator: UserDto): Promise<MuseumDto>;

    /**
     * Finds a museum by a given ID.
     *
     * @param id the museum's ID
     * @return the matched museum, or null if not found
     */
    findOneById(id: string): Promise<MuseumDto | null>;
  };

  user: {
    /**
     * Finds a user by a given ID.
     *
     * @param id the user's ID
     * @return the matched user, or null if not found
     */
    findOneById(id: string): Promise<UserDto | null>;
  };
}
