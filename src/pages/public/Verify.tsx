import { useDemo } from "../../store/DemoStore";
import { useEffect, useRef, useState } from "react";
import { PageHero } from "../../components/PublicLayout";
import { Input, Button, Badge } from "../../components/ui";
import {
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  SearchX,
} from "lucide-react";

type SearchBy = "student_id" | "email" | "phone_number";

const placeholders: Record<SearchBy, string> = {
  student_id: "Enter student ID",
  email: "Enter email address",
  phone_number: "Enter phone number",
};


type MemberResult =
  | { found: false }
  | {
      found: true;
      id: string;
      name: string;
      dept: string;
      studentId: string;
      status: "Active" | "Inactive";
      joined: string;
    };

const searchOptions: { value: SearchBy; label: string; placeholder: string }[] = [
  {
    value: "student_id",
    label: "Student ID",
    placeholder: "Enter student ID",
  },
  {
    value: "email",
    label: "Email",
    placeholder: "Enter email address",
  },
  {
    value: "phone_number",
    label: "Phone Number",
    placeholder: "Enter phone number",
  },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
};

export function Verify() {
  const { state } = useDemo();

  const [q, setQ] = useState("");
  const [searchBy, setSearchBy] = useState<SearchBy>("student_id");  
  const [result, setResult] = useState<MemberResult | null>(null);
  const [loading, setLoading] = useState(false);

const [searchOpen, setSearchOpen] = useState(false);
const [openUpward, setOpenUpward] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!searchOpen) return;

  const handleOutsideClick = (event: PointerEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setSearchOpen(false);
  };

  const updatePosition = () => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setOpenUpward(
      spaceBelow < 200 && spaceAbove > spaceBelow
    );
  };

  document.addEventListener("pointerdown", handleOutsideClick);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);

  updatePosition();

  return () => {
    document.removeEventListener("pointerdown", handleOutsideClick);
    document.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
  };
}, [searchOpen]);


const searchOptions = [
  { value: "student_id", label: "Student ID" },
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone Number" },
] as const satisfies {
  value: SearchBy;
  label: string;
}[];

    const run = async (value: string) => {
    const query = value.trim();

    if (!query || loading) return;

    setLoading(true);
    setResult(null);

    try {
        const response = await fetch("/.netlify/functions/member", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            searchType: searchBy,
            value: query,
        }),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.error || "Verification failed");
        }

        if (!data.registered) {
        setResult({ found: false });
        return;
        }

        const member = data.member;

        setResult({
        found: true,
        id: member.id,
        name: member.name,
        dept: member.department,
        studentId: member.studentId,
        status: member.status,
        joined: member.joinedAt,
        });
    } catch (error) {
        console.error("Member verification failed:", error);
        setResult(null);

        // Replace with your existing toast/notification component if available.
        alert("Unable to verify this member. Please try again.");
    } finally {
        setLoading(false);
    }
    };

  const selectedOption = searchOptions.find(
    (option) => option.value === searchBy
  )!;

  return (
    <>
      <PageHero
        eyebrow="Member verification"
        title="Verify a Member"
        sub="Check whether someone is registered with the club using their member ID, student ID, email, or phone number."
      />

      <section className="mx-auto max-w-2xl px-4 pt-16 pb-40 sm:px-8">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className="card flex flex-col gap-3 p-5 sm:flex-row"
      >
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setResult(null);
          }}
          placeholder="Enter your student ID"
          aria-label="Student ID"
          className="min-w-0 flex-1"
        />

        <Button
          variant="gradient"
          type="submit"
          disabled={loading || !q.trim()}
          className="sm:w-40"
        >
          {loading ? "Checking…" : "Verify"}
        </Button>
      </form>


        <div className="mt-8" aria-live="polite">
          {result &&
            (result.found ? (
              <div
                className={`card animate-rise p-6 ${
                  result.status === "Active"
                    ? "border-emerald-400/30"
                    : "border-amber-400/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.status === "Active" ? (
                    <ShieldCheck className="h-9 w-9 text-emerald-300" />
                  ) : (
                    <ShieldAlert className="h-9 w-9 text-amber-300" />
                  )}

                  <div>
                    <p className="font-display text-2xl font-semibold">
                      {result.status === "Active"
                        ? "Active Member"
                        : "Inactive Member"}
                    </p>
                    <p className="font-mono text-sm text-ice/50">
                      {result.id}
                    </p>
                  </div>

                  {result.status === "Active" && (
                    <Badge tone="green" className="ml-auto">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                  <div>
                    <dt className="text-ice/40">Name</dt>
                    <dd className="font-semibold">{result.name}</dd>
                  </div>
                  <div>
                    <dt className="text-ice/40">Student Id</dt>
                    <dd className="font-semibold">{result.studentId}</dd>
                  </div>
                  <div>
                    <dt className="text-ice/40">Department</dt>
                    <dd className="font-semibold">{result.dept}</dd>
                  </div>
                  <div>
                    <dt className="text-ice/40">Member since</dt>
                    <dd className="font-semibold">{formatDate(result.joined)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="card animate-rise flex items-center gap-3 border-ember/30 p-6">
                <SearchX className="h-9 w-9 text-[#ff8a8a]" />
                <div>
                  <p className="font-display text-2xl font-semibold">
                    Member Not Found
                  </p>
                  <p className="text-sm text-ice/55">
                    No member was found matching the supplied{" "}
                    {selectedOption.label.toLowerCase()}.
                  </p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
