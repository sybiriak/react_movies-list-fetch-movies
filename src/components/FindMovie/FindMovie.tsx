import React, { useState } from 'react';
import './FindMovie.scss';
import { ResponseError } from '../../types/ReponseError';
import classNames from 'classnames';
import { Movie } from '../../types/Movie';
import { MovieCard } from '../MovieCard';
import { getMovie } from '../../api';
import { MovieData } from '../../types/MovieData';

type Props = {
  onAdd: (newMovie: Movie) => void;
};

export const FindMovie: React.FC<Props> = ({ onAdd }) => {
  const [query, setQuery] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [moviePreview, setMoviewPreview] = useState<Movie | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    getMovie(query)
      .then((result: MovieData | ResponseError) => {
        if ((result as ResponseError).Error) {
          setHasError(true);

          return;
        }

        setMoviewPreview({
          title: (result as MovieData).Title,
          description: (result as MovieData).Plot,
          imgUrl:
            (result as MovieData).Poster !== 'N/A'
              ? (result as MovieData).Poster
              : 'https://via.placeholder.com/360x270.png?text=no%20preview',
          imdbId: (result as MovieData).imdbID,
          imdbUrl: `https://www.imdb.com/title/${(result as MovieData).imdbID}`,
        });
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <form className="find-movie" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              className={classNames('input', { 'is-danger': hasError })}
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setHasError(false);
              }}
            />
          </div>

          {hasError && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              disabled={!query}
              className={classNames('button', 'is-light', {
                'is-loading': isLoading,
              })}
            >
              {moviePreview ? 'Search again' : 'Find a movie'}
            </button>
          </div>

          {moviePreview && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={() => {
                  onAdd(moviePreview);
                  setQuery('');
                  setMoviewPreview(null);
                }}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {moviePreview && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={moviePreview} />
        </div>
      )}
    </>
  );
};
