import Link from 'next/link';
import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <main className={styles.container}>
        {/* <img src="/images/logo.svg" alt="logo" /> */}
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>

                <p>{post.data.subtitle}</p>
                <span>
                  <time>
                    <FiCalendar size={20} />
                    {format(
                      new Date(post.first_publication_date),
                      'dd LLL yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                  <p>
                    <FiUser size={20} />
                    {post.data.author}
                  </p>
                </span>
              </a>
            </Link>
          ))}

          {postsPagination.next_page ? (
            <button className={styles.loadMore} type="button">
              Carregar mais posts
            </button>
          ) : (
            ''
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
    revalidate: 60 * 60 * 10, // 10 minutes
  };
};

/* postsResponse SAMPLE

