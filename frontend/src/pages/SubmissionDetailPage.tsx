import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getSubmission, reviewSubmission, reopenSubmission } from '../api/submissions';
import { listComments, addComment, deleteComment } from '../api/comments';
import { getSummary } from '../api/ai';
import { ArrowLeft, CheckCircle, RotateCcw, Loader2, ClipboardList, User, Calendar, Shield, Trash2, MessageSquare, Image, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewSubmission(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenSubmission(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  const [commentText, setCommentText] = useState('');

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => listComments(id!),
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addComment(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentText('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  const [aiExpanded, setAiExpanded] = useState(false);

  const summaryMutation = useMutation({
    mutationFn: () => getSummary(id!),
  });

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="pt-4">
        <ErrorState
          message="Submission not found."
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/projects/${submission.projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{submission.templateName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{submission.templateName}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              submission.status === 'reviewed'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}
          >
            {submission.status === 'reviewed' ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <ClipboardList className="w-3.5 h-3.5" />
            )}
            {submission.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            Submitted by {submission.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(submission.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {submission.reviewedBy && (
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Reviewed by {submission.reviewedBy}
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {submission.status === 'open' ? (
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark as Reviewed
              </button>
            ) : (
              <button
                onClick={() => reopenMutation.mutate()}
                disabled={reopenMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {reopenMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Reopen
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <button
          onClick={() => {
            setAiExpanded(!aiExpanded);
            if (!aiExpanded && !summaryMutation.data && !summaryMutation.isError) {
              summaryMutation.mutate();
            }
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Summary</span>
          </div>
          {aiExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {aiExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
            {summaryMutation.isPending ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating summary...
              </div>
            ) : summaryMutation.isError ? (
              (() => {
                const err = summaryMutation.error as Error & { status?: number };
                if (err.status === 404) {
                  return (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      AI summarization is not configured. Set OPENAI_API_KEY to enable.
                    </p>
                  );
                }
                return (
                  <p className="text-sm text-red-500">
                    Failed to generate summary. Please try again.
                  </p>
                );
              })()
            ) : summaryMutation.data ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {summaryMutation.data.cached && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      Cached
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-400 pl-3">
                  {summaryMutation.data.summary}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-8 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        )}
      </h2>

      {commentsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center mb-6">
          <MessageSquare className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {comment.username[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {comment.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {(isAdmin || comment.userId === user?._id) && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this comment?')) {
                        deleteCommentMutation.mutate(comment._id);
                      }
                    }}
                    disabled={deleteCommentMutation.isPending}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-9">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => addCommentMutation.mutate(commentText)}
            disabled={!commentText.trim() || addCommentMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            Post
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      {submission.media && submission.media.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-8 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Media ({submission.media.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {submission.media.map((m) => (
              <div
                key={m.fileId}
                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square"
              >
                {m.type === 'video' ? (
                  <video
                    src={`/api/media/${m.fileId}`}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={`/api/media/${m.fileId}`}
                    alt="Inspection media"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Item Responses */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inspection Items</h2>
      <div className="space-y-3">
        {submission.items.map((item) => (
          <div
            key={item.tool}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.tool}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {item.details || (
                <span className="italic text-gray-400 dark:text-gray-500">No response</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
