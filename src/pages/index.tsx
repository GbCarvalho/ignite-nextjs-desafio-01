import Link from 'next/link';
import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { useEffect, useState } from 'react';
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);

  async function fetchPosts(receivedNextPage: string): Promise<void> {
    fetch(receivedNextPage)
      .then(response => response.json())
      .then(data => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  useEffect(() => {
    setPosts([...posts, ...postsPagination.results]);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  return (
    <>
      <header className={styles.header}>
        <img src="/images/logo.svg" alt="logo" />
      </header>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
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

          {nextPage ? (
            <button
              className={styles.loadMore}
              type="button"
              onClick={() => fetchPosts(postsPagination.next_page)}
            >
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

{
  "page": 1,
  "results_per_page": 20,
  "results_size": 2,
  "total_results_size": 2,
  "total_pages": 1,
  "next_page": null,
  "prev_page": null,
  "results": [
    {
      "id": "YGhpkBMAACMAbBdz",
      "uid": "como-utilizar-hooks",
      "type": "posts",
      "href": "https://spacenew.cdn.prismic.io/api/v2/documents/search?ref=YGhuCBMAACEAbCuG&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YGhpkBMAACMAbBdz%22%29+%5D%5D",
      "tags": [],
      "first_publication_date": "2021-04-03T13:12:45+0000",
      "last_publication_date": "2021-04-03T13:30:48+0000",
      "slugs": [
        "como-utilizar-hooks",
        "criando-um-app-cra-do-zero"
      ],
      "linked_documents": [],
      "lang": "pt-br",
      "alternate_languages": [],
      "data": {
        "title": "Como utilizar Hooks",
        "subtitle": "Pensando em sincronização em vez de ciclos de vida."
      }
    },
    {
      "id": "YGhpdRMAACAAbBby",
      "uid": "criando-um-app-cra-do-zero",
      "type": "posts",
      "href": "https://spacenew.cdn.prismic.io/api/v2/documents/search?ref=YGhuCBMAACEAbCuG&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22YGhpdRMAACAAbBby%22%29+%5D%5D",
      "tags": [],
      "first_publication_date": "2021-04-03T13:11:36+0000",
      "last_publication_date": "2021-04-03T13:11:36+0000",
      "slugs": [
        "criando-um-app-cra-do-zero"
      ],
      "linked_documents": [],
      "lang": "pt-br",
      "alternate_languages": [],
      "data": {
        "title": "Criando um app CRA do zero",
        "subtitle": "Tudo sobre como criar a sua primeira aplicação utilizando Create React App"
      }
    }
  ],
  "version": "fbb44a3",
  "license": "All Rights Reserved"
}

*/
