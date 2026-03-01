import api from './api';
import { Course, Instructor } from '@/types/course';

const placeholderImage =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800';

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
  return {
    id: String(product?.id ?? product?._id ?? index),
    title: product?.title || product?.name || `Course ${index + 1}`,
    description:
      product?.description ||
      product?.summary ||
      'Build practical skills with this course.',
    thumbnail:
      product?.thumbnail ||
      product?.image ||
      product?.images?.[0] ||
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
  const [usersResponse, productsResponse] = await Promise.all([
    api.get('/public/randomusers', {
      params: {
        page: '1',
        limit: '10',
      },
    }),
    api.get('/public/randomproducts', {
      params: {
        page: '1',
        limit: '10',
        inc: 'category,price,thumbnail,images,title,id',
        query: 'mens-watches',
      },
    }),
  ]);

  const userItems = extractArray(usersResponse.data);
  const productItems = extractArray(productsResponse.data);

  const instructors = userItems.map(mapInstructor);

  return productItems.map((product, index) => {
    const instructor = instructors[index % Math.max(instructors.length, 1)];
    return mapCourse(product, instructor, index);
  });
};
