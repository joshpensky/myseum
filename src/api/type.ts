import { GetServerSidePropsContext } from 'next';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';

export interface MyseumAPI {
  auth: {
    /**
     * Gets a user based on SSR context.
     * @param context the Next.js SSR context
     */
    getUserByCookie(context: GetServerSidePropsContext): Promise<UserDto | null>;
  };

  gallery: {
    /**
     * Finds all galleries within a given museum.
     *
     * @param museum the museum to search within
     * @return the museum's galleries
     */
    findAllByMuseum(museum: MuseumDto): Promise<GalleryDto[]>;
  };

  museum: {
    /**
     * Finds a musuem for a given curator.
     *
     * @param curator the museum's curator
     * @return the curator's museum
     */
    findOneByCurator(curator: UserDto): Promise<MuseumDto>;
  };
}
