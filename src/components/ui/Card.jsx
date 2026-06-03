function Card({ className, children, ...props }) {
  return (
    <section>
      <div
        className={`${
          className && className
        } text-center transition-shadow hover:shadow-lg bg-(--gray-color) dark:hover:shadow-neutral-700 dark:bg-(--card-dark) text-(--foreground) rounded-lg border border-stone-100 dark:border-stone-800`}
        {...props}
      >
        {children}
      </div>
    </section>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h1 className={className} {...props}>
      {children}
    </h1>
  );
}

function CardDescription({ className, ...props }) {
  return <div className="text-(--greenish-color) text-sm" {...props} />;
}

// function CardAction({ className, ...props }) {
//    return <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end" {...props} />;
//}

function CardContent({ className, children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
