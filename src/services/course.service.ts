import { Course, Instructor } from '@/types/course';
import api from './api';

const placeholderImage =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800';

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const formatCategory = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return 'General';
  }

  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const extractArray = (payload: any): any[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const extractProducts = (payload: any): any[] => {
  // /public/randomproducts response shape:
  // { data: { data: [...] } }
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return extractArray(payload);
};

const mapInstructor = (item: any, index: number): Instructor => {
  const firstName =
    item?.name?.first || item?.firstName || item?.firstname || 'Instructor';
  const lastName =
    item?.name?.last || item?.lastName || item?.lastname || `${index + 1}`;

  return {
    id: String(item?.id ?? item?.login?.uuid ?? item?._id ?? index),
    name: `${firstName} ${lastName}`.trim(),
    avatar:
      item?.picture?.medium ||
      item?.picture?.large ||
      item?.picture?.thumbnail ||
      item?.image ||
      item?.avatar ||
      placeholderImage,
  };
};

const mapCourse = (
  product: any,
  instructor: Instructor | undefined,
  index: number
): Course => {
  const category = product?.category;
  const price = product?.price;
  const categoryLabel = formatCategory(category);
  const fallbackDescription =
    typeof price === 'number'
      ? `${categoryLabel} course. Estimated price: $${price}.`
      : `${categoryLabel} course.`;

  return {
    id: String(product?.id ?? product?._id ?? index),
    title: product?.title || product?.name || `Course ${index + 1}`,
    description:
      product?.description ||
      product?.summary ||
      fallbackDescription,
    thumbnail:
      product?.thumbnail ||
      product?.images?.[0] ||
      product?.image ||
      placeholderImage,
    instructor:
      instructor || {
        id: 'unknown',
        name: 'Unknown Instructor',
        avatar: placeholderImage,
      },
    price: product?.price,
    category: product?.category,
  };
};

export const fetchCoursesWithInstructors = async (): Promise<Course[]> => {
  const [usersResult, productsResult] = await Promise.allSettled([
    withTimeout(
      api.get('/public/randomusers', {
        params: {
          page: '1',
          limit: '10',
        },
      }),
      12000,
      'Instructors request timed out.'
    ),
    withTimeout(
      api.get('/public/randomproducts', {
        params: {
          page: '1',
          limit: '10',
          inc: 'category,price,thumbnail,images,title,id',
        },
      }),
      12000,
      'Courses request timed out.'
    ),
  ]);

  // Console the raw API responses
  if (usersResult.status === 'fulfilled') {
    console.log('=== USERS API RESPONSE ===');
    console.log(JSON.stringify(usersResult.value.data, null, 2));
  } else {
    console.log('=== USERS API ERROR ===');
    console.log(usersResult.reason);
  }

  if (productsResult.status === 'fulfilled') {
    console.log('=== PRODUCTS API RESPONSE ===');
    console.log(JSON.stringify(productsResult.value.data, null, 2));
  } else {
    console.log('=== PRODUCTS API ERROR ===');
    console.log(productsResult.reason);
  }

  if (productsResult.status !== 'fulfilled') {
    throw new Error('Unable to fetch course catalog right now.');
  }

  const userItems =
    usersResult.status === 'fulfilled' ? extractArray(usersResult.value.data) : [];
  const productItems = extractProducts(productsResult.value.data);

  if (productItems.length === 0) {
    throw new Error('Course catalog is empty right now.');
  }

  const instructors = userItems.map(mapInstructor);

  return productItems.map((product, index) => {
    const instructor = instructors[index % Math.max(instructors.length, 1)];
    return mapCourse(product, instructor, index);
  });
};
