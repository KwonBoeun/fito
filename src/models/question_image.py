from sqlalchemy import Integer, SmallInteger, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


class QuestionImage(Base):
    __tablename__ = "question_images"

    id                : Mapped[int]      = mapped_column(primary_key=True)
    question_id       : Mapped[int]      = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    image_url         : Mapped[str]      = mapped_column(Text, nullable=False)
    # 로컬 저장: /static/uploads/questions/{uuid}.ext  (추후 S3 교체 시 이 컬럼값만 변경)
    original_filename : Mapped[str|None] = mapped_column(Text, nullable=True)
    order             : Mapped[int]      = mapped_column(SmallInteger, nullable=False, default=0)

    question = relationship("Question", back_populates="images")

    def to_dict(self) -> dict:
        return {"url": self.image_url, "order": self.order}